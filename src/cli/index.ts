import { Command } from "commander";
import build from "./build";

const dialect = new Command("react-dialect");
dialect.description("A next-gen translation library for React");
dialect.version("0.1.0");

dialect
  .command("build")
  .description("Build translation locales and configuration files")
  .option("-r, --remove-unused", "Remove unused translations")
  .action((options) => tryCatch(build(options as CliConfig)));

dialect.parse(process.argv);

async function tryCatch(promise: PromiseLike<unknown>) {
  try {
    await promise;
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
