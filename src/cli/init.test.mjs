import test from "ava";
import * as fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import init from "../../dist/init.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../../temp/sample");

/** @param {string} segment */
function resolveProjectPath(segment) {
  return path.resolve(PROJECT_ROOT, segment);
}

test.before(() => {
  if (fs.existsSync(PROJECT_ROOT)) {
    fs.rmSync(PROJECT_ROOT, { recursive: true });
  }

  fs.mkdirSync(PROJECT_ROOT, { recursive: true });
});

test.after.always(() => {
  if (fs.existsSync(PROJECT_ROOT)) {
    fs.rmSync(PROJECT_ROOT, { recursive: true });
  }
});

test("initializes 'dialect.config.json'", async (t) => {
  /** @type CliConfig */
  const config = { $cwd: PROJECT_ROOT };
  const dialectConfigPath = resolveProjectPath("dialect.config.json");

  await init(config);

  t.true(fs.existsSync(dialectConfigPath), '"dialect.config.json" missing');

  /** @type DialectConfig */
  const projectConfig = JSON.parse(fs.readFileSync(dialectConfigPath, "utf-8"));
  t.deepEqual(projectConfig.content, ["src"], "Invalid content sources");
  t.deepEqual(projectConfig.languages, ["en"], "Invalid languages array");
  t.is(projectConfig.baseLanguage, "en", "Invalid base language");
});
