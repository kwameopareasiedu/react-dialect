// noinspection RegExpRedundantEscape

import * as path from "path";
import * as fs from "fs";

const CONFIG_FILE_NAME = "dialect.config.json";
const SUPPORTED_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

export default async function build() {
  const config = parseConfigFile();

  const entries = config.roots.reduce((entries, root) => {
    return [...entries, ...processDirectory(root, config)];
  }, [] as TranslationEntry[]);

  console.dir(entries, { depth: null });
}

function parseConfigFile(): DialectConfig {
  const configFilePath = path.resolve(process.cwd(), CONFIG_FILE_NAME);
  if (!fs.existsSync(configFilePath)) throw `missing "${CONFIG_FILE_NAME}"`;

  const config = JSON.parse(fs.readFileSync(configFilePath, "utf-8")) as DialectConfig;
  if (!config.roots) throw `missing "roots" field in "${CONFIG_FILE_NAME}"`;
  if (!Array.isArray(config.roots)) throw `"roots" must be an array`;
  if (config.roots.length === 0) throw `"roots" must contain at least one entry`;

  if (!config.languages) throw `missing "languages" field in "${CONFIG_FILE_NAME}"`;
  if (!Array.isArray(config.languages)) throw `"languages" must be an array`;
  if (config.languages.length === 0) throw `"language" must contain at least one entry`;

  if (!config.base) throw `missing "base" field in "${CONFIG_FILE_NAME}"`;
  if (!config.languages.includes(config.base)) throw `"base" must be included in "languages" array`;

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
    translationEntries.push(...processFile(absolutePath, config));
  }

  for (const dirent of dirDirents) {
    const parentPath = dirent.parentPath ?? dirent.path;
    const absolutePath = path.resolve(parentPath, dirent.name);
    translationEntries.push(...processDirectory(path.relative(cwd, absolutePath), config));
  }

  return translationEntries;
}

function processFile(absoluteFilePath: string, config: DialectConfig): TranslationEntry[] {
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
    const keys = tokens.map((token) => token.value);
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
