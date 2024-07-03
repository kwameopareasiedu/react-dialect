import * as path from "path";
import * as fs from "fs";
import { configFileName } from "@/cli/config";

export default async function init(cliConfig: Pick<CliConfig, "$cwd">) {
  const configFilePath = path.resolve(cliConfig.$cwd, configFileName);
  if (fs.existsSync(configFilePath)) throw `"dialect.config.json" already exists`;

  const config: DialectConfig = { content: ["src"], languages: ["en"], baseLanguage: "en" };
  fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
}
