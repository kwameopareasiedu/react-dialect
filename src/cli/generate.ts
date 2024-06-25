// noinspection RegExpRedundantEscape

import * as path from "path";
import * as fs from "fs";

const SUPPORTED_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

export default async function generate(cliConfig: CliConfig) {
  const projectConfig = parseConfigFile(cliConfig);

  const keys = projectConfig.content.reduce((keys, root) => {
    return [...keys, ...processDirectory(root, cliConfig)];
  }, [] as string[]);

  saveTranslationEntries(keys, projectConfig, cliConfig);
}

function parseConfigFile(cliConfig: CliConfig): DialectConfig {
  const configFileName = "dialect.config.json";
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

function processDirectory(relativePath: string, cliConfig: CliConfig): string[] {
  const dirPath = path.resolve(cliConfig.$cwd, relativePath);
  if (!fs.existsSync(dirPath)) throw `"${dirPath}" does not exist`;
  if (!fs.lstatSync(dirPath).isDirectory()) throw `"${dirPath}" is not a directory`;

  const dirents = fs.readdirSync(dirPath, { withFileTypes: true });
  const dirDirents = dirents.filter((d) => d.isDirectory());
  const fileDirents = dirents.filter((d) => d.isFile() && SUPPORTED_EXTENSIONS.includes(path.extname(d.name)));

  const translationKeys: string[] = [];

  for (const dirent of fileDirents) {
    const parentPath = dirent.parentPath ?? dirent.path;
    const absolutePath = path.resolve(parentPath, dirent.name);
    translationKeys.push(...processFile(absolutePath));
  }

  for (const dirent of dirDirents) {
    const parentPath = dirent.parentPath ?? dirent.path;
    const absolutePath = path.resolve(parentPath, dirent.name);
    const relativeDirentPath = path.relative(cliConfig.$cwd, absolutePath);
    translationKeys.push(...processDirectory(relativeDirentPath, cliConfig));
  }

  return translationKeys;
}

function processFile(absoluteFilePath: string): string[] {
  const sourceCode = fs.readFileSync(absoluteFilePath, { encoding: "utf-8" });
  const componentImportName = getTranslateComponentImportName(sourceCode);
  if (!componentImportName) return []; // No import of Translate from "react-dialect"

  const translationStringRegex = new RegExp(`<${componentImportName}(?:.+)??>(.+?)<\\/${componentImportName}>`, "gs");
  const translationStringMatches = sourceCode.matchAll(translationStringRegex);
  const translationKeys: string[] = [];

  for (const match of translationStringMatches) {
    const key = match[1]
      .trim()
      .replaceAll("\n", " ") // Replace new lines with white space
      .replaceAll(/\{"( +)?"\}/g, " ") // Replace interpolated consecutive whitespaces with a single one
      .replaceAll(/ {2,}/g, " "); // Replace consecutive whitespaces with a single one

    translationKeys.push(key);
  }

  // TODO: Implement check for translate function (used in side effects)

  return translationKeys;
}

function getTranslateComponentImportName(source: string) {
  const prettySource = source
    .split(/[\n;]/g) // Split by new line or semicolon
    .map((line) => line.trim())
    .filter((line) => !!line)
    .join("\n");

  const importPatternRegex = /^import ?\{([\w \n,]+?)\} ?from ['"]react-dialect['"];?$/ms;
  const importStringMatch = prettySource.match(importPatternRegex);
  if (!importStringMatch) return null;

  const importedString = importStringMatch[1].trim();
  const importedModuleNames = importedString.split(",").map((part) => part.trim());

  for (const moduleName of importedModuleNames) {
    if (moduleName === "Translate") {
      // Translate is imported as is
      return moduleName;
    } else if (moduleName.indexOf("as") !== -1) {
      // Translate is import using an alias
      const parts = moduleName.split("as ");
      return parts[1];
    }
  }

  return null;
}

// function tokenizeString(translationStr: string) {
//   const str = translationStr
//     .trim()
//     .replaceAll("\n", " ") // Replace new lines with white space
//     .replaceAll(/\{"( +)?"\}/g, " ") // Replace interpolated consecutive whitespaces with a single one
//     .replaceAll(/ {2,}/g, " "); // Replace consecutive whitespaces with a single one
//
//   const tokens = [] as KeyToken[];
//   let currentToken = "";
//   let pos = 0;
//
//   while (pos < str.length) {
//     const char = str[pos++];
//
//     if (char === "{") {
//       tokens.push({ type: "static", value: currentToken });
//       currentToken = char;
//     } else if (char === "}") {
//       currentToken += char;
//       tokens.push({ type: "variable", value: currentToken });
//       currentToken = "";
//     } else currentToken += char;
//   }
//
//   if (currentToken) {
//     tokens.push({ type: "static", value: currentToken });
//   }
//
//   return tokens;
// }

function saveTranslationEntries(keys: string[], projectConfig: DialectConfig, cliConfig: CliConfig) {
  const localesDirPath = path.resolve(cliConfig.$cwd, "public", "locales");
  if (!fs.existsSync(localesDirPath)) fs.mkdirSync(localesDirPath, { recursive: true });

  const targetLanguages = projectConfig.languages.filter((lang) => lang !== projectConfig.baseLanguage);

  for (const language of targetLanguages) {
    const translationsFilePath = path.resolve(localesDirPath, `${language}.json`);
    const newTranslationsMap = keys.reduce((map, key) => ({ ...map, [key]: "" }), {});

    if (!fs.existsSync(translationsFilePath)) {
      fs.writeFileSync(translationsFilePath, JSON.stringify(newTranslationsMap, null, 2));
    } else {
      const existingTranslationsMap = JSON.parse(fs.readFileSync(translationsFilePath, "utf-8")) as {
        [k: string]: string;
      };

      const mergedTranslationsMap = Object.keys(newTranslationsMap).reduce((map, key) => {
        if (!map[key]) {
          return { ...map, [key]: newTranslationsMap[key] };
        } else return map;
      }, existingTranslationsMap);

      if (cliConfig.removeUnused) {
        const mergedKeys = Object.keys(mergedTranslationsMap);
        const newKeys = Object.keys(newTranslationsMap);

        for (const key of mergedKeys) {
          if (!newKeys.includes(key)) {
            delete mergedTranslationsMap[key];
          }
        }
      }

      fs.writeFileSync(translationsFilePath, JSON.stringify(mergedTranslationsMap, null, 2));
    }
  }
}
