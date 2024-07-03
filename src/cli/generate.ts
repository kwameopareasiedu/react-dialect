// noinspection RegExpRedundantEscape

import * as path from "path";
import * as fs from "fs";
import { configFileName } from "@/cli/config";

const SUPPORTED_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

export default async function generate(cliConfig: CliConfig) {
  const projectConfig = parseConfigFile(cliConfig);

  const keys = projectConfig.content.reduce((keys, root) => {
    return [...keys, ...processDirectory(root, cliConfig)];
  }, [] as TranslationKey[]);

  saveTranslationKeys(keys, projectConfig, cliConfig);
}

function parseConfigFile(cliConfig: CliConfig): DialectConfig {
  const configFilePath = path.resolve(cliConfig.$cwd, configFileName);
  if (!fs.existsSync(configFilePath)) throw `missing "${configFileName}"`;

  const config = JSON.parse(fs.readFileSync(configFilePath, "utf-8")) as DialectConfig;
  if (!config.content) throw `missing required "content" field in "${configFileName}"`;
  if (!Array.isArray(config.content)) throw `"content" must be an array`;
  if (config.content.length === 0) throw `"content" must contain at least one entry`;

  if (!config.languages) throw `missing required "languages" field in "${configFileName}"`;
  if (!Array.isArray(config.languages)) throw `"languages" must be an array`;
  if (config.languages.length === 0) throw `"language" must contain at least one entry`;

  if (!config.baseLanguage) throw `missing required "baseLanguage" field in "${configFileName}"`;
  if (!config.languages.includes(config.baseLanguage)) throw `"baseLanguage" must be included in "languages" array`;

  return config;
}

function processDirectory(relativePath: string, cliConfig: CliConfig): TranslationKey[] {
  const dirPath = path.resolve(cliConfig.$cwd, relativePath);
  if (!fs.existsSync(dirPath)) throw `"${dirPath}" does not exist`;
  if (!fs.lstatSync(dirPath).isDirectory()) throw `"${dirPath}" is not a directory`;

  const dirents = fs.readdirSync(dirPath, { withFileTypes: true });
  const dirDirents = dirents.filter((d) => d.isDirectory());
  const fileDirents = dirents.filter((d) => d.isFile() && SUPPORTED_EXTENSIONS.includes(path.extname(d.name)));

  const translationKeys: TranslationKey[] = [];

  for (const dirent of fileDirents) {
    const parentPath = dirent.parentPath ?? dirent.path;
    const absolutePath = path.resolve(parentPath, dirent.name);
    translationKeys.push(...parseFile(absolutePath, cliConfig));
  }

  for (const dirent of dirDirents) {
    const parentPath = dirent.parentPath ?? dirent.path;
    const absolutePath = path.resolve(parentPath, dirent.name);
    const relativeDirentPath = path.relative(cliConfig.$cwd, absolutePath);
    translationKeys.push(...processDirectory(relativeDirentPath, cliConfig));
  }

  return translationKeys;
}

function parseFile(absoluteFilePath: string, cliConfig: CliConfig): TranslationKey[] {
  const sourceCode = fs.readFileSync(absoluteFilePath, { encoding: "utf-8" });
  const translationKeys: string[] = [];

  // Process imports statements for Translation component
  const componentImportName = getImportedModuleName(sourceCode, "Translate");

  if (componentImportName) {
    // Match the children of component imports (I.e. `<componentImportName>{TARGET}</componentImportName>`)
    const translationStringRegex = new RegExp(`<${componentImportName}(?:.+)??>(.+?)<\\/${componentImportName}>`, "gs");
    const translationStringMatches = sourceCode.matchAll(translationStringRegex);

    for (const match of translationStringMatches) {
      const key = match[1]
        .trim()
        .replaceAll("\n", " ") // Replace new lines with white space
        .replaceAll(/\{"( +)?"\}/g, " ") // Replace interpolated consecutive whitespaces with a single one
        .replaceAll(/ {2,}/g, " "); // Replace consecutive whitespaces with a single one

      translationKeys.push(key);
    }
  }

  // Process usages of useTranslation hook
  const hookFunctionNames = getHookFunctionNames(sourceCode);

  if (hookFunctionNames) {
    for (const hookFunctionName of hookFunctionNames) {
      // Match the children of hook function (I.e. `hookFunctionName(TARGET)`)
      const translationStringRegex = new RegExp(
        `${hookFunctionName}\\((?:[\n ]+?)?["'\`](.+?)['"\`],?(?:[\n ]+?)?\\);?`,
        "gms",
      );
      const translationStringMatches = sourceCode.matchAll(translationStringRegex);

      for (const match of translationStringMatches) {
        const key = match[1]
          .trim()
          .replaceAll("\n", " ") // Replace new lines with white space
          .replaceAll(/ {2,}/g, " ") // Replace consecutive whitespaces with a single one
          .replaceAll(/\$({\w+})/g, "$1"); // Replace "${name}" with "{name}"

        translationKeys.push(key);
      }
    }
  }

  const relativeFilePath = path.relative(cliConfig.$cwd, absoluteFilePath);
  return translationKeys.map((key) => ({ key: key, path: relativeFilePath }));
}

function getImportedModuleName(source: string, targetModuleName: string) {
  const prettySource = source
    .split(/[\n;]/g) // Split by new line or semicolon
    .map((line) => line.trim())
    .filter((line) => !!line)
    .join("\n");

  const importPatternRegex = /^import ?\{([\w \n,]+?)\} ?from ?['"]react-dialect['"];?$/ms;
  const importStringMatch = prettySource.match(importPatternRegex);
  if (!importStringMatch) return null;

  const importedModuleString = importStringMatch[1].trim();
  const importedModuleNames = importedModuleString.split(",").map((part) => part.trim());

  for (const moduleName of importedModuleNames) {
    if (moduleName === targetModuleName) {
      // Module is imported as is
      return moduleName;
    } else if (moduleName.indexOf(targetModuleName) !== -1 && moduleName.indexOf("as") !== -1) {
      // Module is imported using an alias
      const parts = moduleName.split("as ");
      return parts[1];
    }
  }

  return null;
}

function getHookFunctionNames(source: string) {
  const prettySource = source
    .split(/[\n;]/g) // Split by new line or semicolon
    .map((line) => line.trim())
    .filter((line) => !!line)
    .join("\n");

  const hookImportName = getImportedModuleName(prettySource, "useTranslation");
  if (!hookImportName) return null;

  const usagePatternRegex = new RegExp(`^\\w+(?: ?)+(.+?)(?: ?)+=(?: ?)+${hookImportName}\\(\\);?$`, "gm"); // Match "const ___ = useTranslation();
  const usageStrings = [] as string[];
  let usageStringMatch: RegExpExecArray | null;

  while ((usageStringMatch = usagePatternRegex.exec(prettySource)) !== null) {
    usageStrings.push(usageStringMatch[1].trim());
  }

  if (usageStrings.length === 0) return null;

  const destructuredAliasUsageRegex = /^{.+translate(?: ?)+:(?: ?)+(\w+).+}$/; // Match "{ translate: t }" pattern
  const destructuredUsageRegex = /^{.+translate.+}$/; // Match "{ translate }" pattern
  const variableUsageRegex = /^\w+$/; // Match un-destructured pattern

  return usageStrings.reduce((names, str) => {
    if (destructuredAliasUsageRegex.test(str)) return [...names, destructuredAliasUsageRegex.exec(str)![1]];
    if (destructuredUsageRegex.test(str)) return [...names, "translate"];
    if (variableUsageRegex.test(str)) return [...names, `${str}.translate`];
    return names;
  }, [] as string[]);
}

function saveTranslationKeys(keys: TranslationKey[], projectConfig: DialectConfig, cliConfig: CliConfig) {
  const localesDirPath = path.resolve(cliConfig.$cwd, "public", "locales");
  if (!fs.existsSync(localesDirPath)) fs.mkdirSync(localesDirPath, { recursive: true });

  const targetLanguages = projectConfig.languages.filter((lang) => lang !== projectConfig.baseLanguage);
  const foundTranslationsMap = keys.reduce((map, key) => ({ ...map, [key.key]: "" }), {});
  const newTranslationKeys = [...keys]; // Start with found keys

  for (const language of targetLanguages) {
    const translationsFilePath = path.resolve(localesDirPath, `${language}.json`);

    if (!fs.existsSync(translationsFilePath)) {
      fs.writeFileSync(translationsFilePath, JSON.stringify(foundTranslationsMap, null, 2));
    } else {
      const existingTranslationsMap = JSON.parse(fs.readFileSync(translationsFilePath, "utf-8")) as {
        [k: string]: string;
      };

      if (cliConfig.showReport) {
        console.log(`Existing Translations: ${language}`);
        console.log("=====================");
        Object.keys(existingTranslationsMap).forEach((key) => console.log(key));
        console.log("\n");
      }

      // Remove keys in newTranslationKeys which exist in existingTranslationsMap
      for (const translationKey of keys) {
        if (Object.keys(existingTranslationsMap).includes(translationKey.key)) {
          const removeIdx = newTranslationKeys.indexOf(translationKey);
          if (removeIdx !== -1) newTranslationKeys.splice(removeIdx, 1);
        }
      }

      const mergedTranslationsMap = Object.keys(foundTranslationsMap).reduce((map, key) => {
        if (!map[key]) {
          return { ...map, [key]: foundTranslationsMap[key] };
        } else return map;
      }, existingTranslationsMap);

      if (cliConfig.removeUnused) {
        const mergedKeys = Object.keys(mergedTranslationsMap);
        const newKeys = Object.keys(foundTranslationsMap);

        for (const key of mergedKeys) {
          if (!newKeys.includes(key)) {
            delete mergedTranslationsMap[key];
          }
        }
      }

      fs.writeFileSync(translationsFilePath, JSON.stringify(mergedTranslationsMap, null, 2));
    }
  }

  if (cliConfig.showReport) {
    console.log(`New Translation Keys: ${newTranslationKeys.length}`);
    console.log("====================");

    if (newTranslationKeys.length > 0) {
      newTranslationKeys.forEach((key) => console.log(`Found "${key.key}" in "${key.path}"`));
    } else console.log("N/A");
  }
}
