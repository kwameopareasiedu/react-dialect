import * as path from "path";
import * as fs from "fs";

const CONFIG_FILE_NAME = "dialect.config.json";
const SUPPORTED_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

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

  for (const dirent of dirDirents) {
    const relativeDirentPath = path.resolve(dirent.path, dirent.name);
    processDirectory(path.relative(cwd, relativeDirentPath));
  }
}
