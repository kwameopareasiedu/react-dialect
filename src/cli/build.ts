import * as path from "path";
import * as fs from "fs";

const CONFIG_FILE_NAME = "dialect.config.json";
const SUPPORTED_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];
const DEFAULT_IMPORT_STATEMENT = /^import ?\{ ?(\w+) ?\} ?from ['"]react-dialect['"];?$/m;
const ALIASED_IMPORT_STATEMENT = /^import ?\{ ?Translate as (\w+) ?\} ?from ['"]react-dialect['"];?$/m;

export default async function build() {
  const config = parseConfigFile();

  config.roots.forEach((root) => processDirectory(root));
}

function parseConfigFile() {
  const configFilePath = path.resolve(process.cwd(), CONFIG_FILE_NAME);
  if (!fs.existsSync(configFilePath)) throw `missing "${CONFIG_FILE_NAME}"`;

  const config = JSON.parse(fs.readFileSync(configFilePath, "utf-8")) as DialectConfig;
  if (!config.roots) throw `missing "roots" field in "${CONFIG_FILE_NAME}"`;
  if (!Array.isArray(config.roots)) throw `"roots" must be an array`;
  return config;
}

function processDirectory(relativePath: string) {
  const cwd = process.cwd();
  const dirPath = path.resolve(cwd, relativePath);
  if (!fs.existsSync(dirPath)) throw `"${dirPath}" does not exist`;
  if (!fs.lstatSync(dirPath).isDirectory()) throw `"${dirPath}" is not a directory`;

  const dirents = fs.readdirSync(dirPath, { withFileTypes: true });
  const dirDirents = dirents.filter((d) => d.isDirectory());
  const fileDirents = dirents.filter((d) => d.isFile() && SUPPORTED_EXTENSIONS.includes(path.extname(d.name)));

  for (const dirent of fileDirents) {
    const parentPath = dirent.parentPath ?? dirent.path;
    const absolutePath = path.resolve(parentPath, dirent.name);
    processFile(absolutePath);
  }

  for (const dirent of dirDirents) {
    const parentPath = dirent.parentPath ?? dirent.path;
    const absolutePath = path.resolve(parentPath, dirent.name);
    processDirectory(path.relative(cwd, absolutePath));
  }
}

function processFile(absoluteFilePath: string) {
  const source = fs.readFileSync(absoluteFilePath, { encoding: "utf-8" });
  const componentImportNameMatch = source.match(DEFAULT_IMPORT_STATEMENT) ?? source.match(ALIASED_IMPORT_STATEMENT);
  if (!componentImportNameMatch) return; // No `import { Translate } from "react-dialect"` statement

  const componentImportName = componentImportNameMatch[1];
  const componentStringRegex = new RegExp(`<${componentImportName}(?:.+)?>(.+)<\\/${componentImportName}>`, "g");
  const componentStringMatchesIter = source.matchAll(componentStringRegex);

  const componentStrings = [] as string[];

  for (const match of componentStringMatchesIter) {
    componentStrings.push(match[1]);
  }

  console.log(componentStrings);
}
