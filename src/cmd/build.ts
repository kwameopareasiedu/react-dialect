import path from "path";
import * as fs from "fs";

export default async function build() {
  const cwd = process.cwd();

  const configName = "dialect.config.json";
  const configPath = path.resolve(cwd, configName);
  const configExists = fs.existsSync(configPath);
  if (!configExists) throw "missing 'dialect.config.json'";

  const config = JSON.parse(fs.readFileSync(configPath, "utf-8")) as DialectConfig;
  if (!config.root) throw "missing 'root' path in config";

  const rootPath = path.resolve(cwd, config.root);
  const rootExists = fs.existsSync(rootPath);
  if (!rootExists) throw `missing path '${rootPath}'`;

  console.log(rootPath);
}
