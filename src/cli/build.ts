// noinspection RegExpRedundantEscape

import * as path from "path";
import * as fs from "fs";

const SUPPORTED_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

export default async function build() {
  const config = parseConfigFile();

  const entries = config.content.reduce((entries, root) => {
    return [...entries, ...processDirectory(root, config)];
  }, [] as TranslationEntry[]);

  saveTranslationEntries(entries, config);
}

function parseConfigFile(): DialectConfig {
  const configFileName = "dialect.config.json";
  const configFilePath = path.resolve(process.cwd(), configFileName);
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

function processDirectory(relativePath: string, config: DialectConfig): TranslationEntry[] {
  const cwd = process.cwd();
  const dirPath = path.resolve(cwd, relativePath);
  if (!fs.existsSync(dirPath)) throw `"${dirPath}" does not exist`;
  if (!fs.lstatSync(dirPath).isDirectory()) throw `"${dirPath}" is not a directory`;

  const dirents = fs.readdirSync(dirPath, { withFileTypes: true });
  const dirDirents = dirents.filter((d) => d.isDirectory());
  const fileDirents = dirents.filter((d) => d.isFile() && SUPPORTED_EXTENSIONS.includes(path.extname(d.name)));

  const translationEntries: TranslationEntry[] = [];

  for (const dirent of fileDirents) {
    const parentPath = dirent.parentPath ?? dirent.path;
    const absolutePath = path.resolve(parentPath, dirent.name);
    translationEntries.push(...processFile(absolutePath));
  }

  for (const dirent of dirDirents) {
    const parentPath = dirent.parentPath ?? dirent.path;
    const absolutePath = path.resolve(parentPath, dirent.name);
    translationEntries.push(...processDirectory(path.relative(cwd, absolutePath), config));
  }

  return translationEntries;
}

function processFile(absoluteFilePath: string): TranslationEntry[] {
  const sourceCode = fs.readFileSync(absoluteFilePath, { encoding: "utf-8" });
  const defaultImportRegex = /^import ?\{ ?(\w+) ?\} ?from ['"]react-dialect['"];?$/m;
  const aliasedImportRegex = /^import ?\{ ?Translate as (\w+) ?\} ?from ['"]react-dialect['"];?$/m;
  const componentImportNameMatch = sourceCode.match(defaultImportRegex) ?? sourceCode.match(aliasedImportRegex);
  if (!componentImportNameMatch) return []; // No `import { Translate } from "react-dialect"` statement

  const componentImportName = componentImportNameMatch[1];
  const translationStringRegex = new RegExp(`<${componentImportName}(?:.+)??>(.+?)<\\/${componentImportName}>`, "gs");
  const translationStringMatches = sourceCode.matchAll(translationStringRegex);

  const translationEntries: TranslationEntry[] = [];

  for (const match of translationStringMatches) {
    const tokens = tokenizeString(match[1]);
    const keys = tokens.map((token) => token.value.toLowerCase());
    const isVariable = tokens.reduce((isVar, token) => isVar || token.type === "variable", false);

    translationEntries.push({ key: keys, type: isVariable ? "variable" : "static" });
  }

  return translationEntries;
}

function tokenizeString(translationStr: string) {
  let str = translationStr.trim();
  str = str.replaceAll("\n", " "); // Replace new lines with white space
  str = str.replaceAll(/\{"( +)?"\}/g, " "); // Replace interpolated consecutive whitespaces with a single one
  str = str.replaceAll(/ {2,}/g, " "); // Replace consecutive whitespaces with a single one

  const tokens = [] as KeyToken[];
  let currentToken = "";
  let pos = 0;

  while (pos < str.length) {
    const char = str[pos++];

    if (char === "{") {
      tokens.push({ type: "static", value: currentToken });
      currentToken = char;
    } else if (char === "}") {
      currentToken += char;
      tokens.push({ type: "variable", value: currentToken });
      currentToken = "";
    } else currentToken += char;
  }

  if (currentToken) {
    tokens.push({ type: "static", value: currentToken });
  }

  return tokens;
}

function saveTranslationEntries(entries: TranslationEntry[], config: DialectConfig) {
  const cwd = process.cwd();
  const keyDelimiter = "____";
  const localesDirPath = path.resolve(cwd, "public", "locales");
  if (!fs.existsSync(localesDirPath)) fs.mkdirSync(localesDirPath, { recursive: true });

  const targetLanguages = config.languages.filter((lang) => lang !== config.baseLanguage);

  for (const language of targetLanguages) {
    const languageTranslationsFilePath = path.resolve(localesDirPath, `${language}.json`);

    const languageTranslationsMap = entries.reduce((map, entry) => {
      const entryKey = entry.key.join(keyDelimiter);
      return { ...map, [entryKey]: "" };
    }, {});

    if (!fs.existsSync(languageTranslationsFilePath)) {
      fs.writeFileSync(languageTranslationsFilePath, JSON.stringify(languageTranslationsMap, null, 2));
    }
  }
}
