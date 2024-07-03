import { Command } from "commander";
import generate from "@/cli/generate";
import init from "@/cli/init";

const dialect = new Command("react-dialect");
dialect.description("A next-gen translation library for React");
dialect.version("0.1.0");

dialect
  .command("init")
  .description("Initialize dialect.config.json")
  .action(async () => {
    const config = { $cwd: process.cwd() };
    await tryCatch(init(config));
  });

dialect
  .command("generate")
  .description("Generate translation locale files (e.g. fr.json, en.json, etc)")
  .option("-r, --remove-unused", "Remove unused translation keys")
  .option("-s, --show-report", "Display a report on new and existing keys")
  .action(async (options) => {
    const config = { ...options, $cwd: process.cwd() };
    await tryCatch(generate(config as CliConfig));
  });

dialect.parse(process.argv);

async function tryCatch(promise: PromiseLike<unknown>) {
  try {
    await promise;
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
