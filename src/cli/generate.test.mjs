import test from "ava";
import * as fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import generate from "../../dist/generate.js";

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

  fs.mkdirSync(resolveProjectPath("src"), { recursive: true });

  fs.writeFileSync(
    resolveProjectPath("dialect.config.json"),
    `
    {
      "content": ["src"],
      "languages": ["en", "fr", "ge"],
      "baseLanguage": "en"
    }
    `,
  );

  fs.writeFileSync(
    resolveProjectPath("src/first.tsx"),
    `
      import { Translate, useTranslation } from "react-dialect";
      
      function First() {
        const [count, setCount] = useState(0);
        const [name, setName] = useState(randFullName());
        const { setCurrentLanguage } = useTranslation();
      
        return (
          <>
            <Translate>Next gen translation library</Translate>
            <Translate>It supports interpolation like so: {count}</Translate>
            <Translate>
              Even with long paragraph statements that get formatted into multiple
              lines with tools like Prettier, react-dialect just works.
            </Translate>
            <Translate>
              Even better, long paragraph statements that get reformatted can still
              contain interpolated values like so: {count} and a second like so:{" "}
              {name} and still be parsed by react-dialect
            </Translate>
            <Translate>
              React dialect can even replace the same value interpolated multiple
              times in a string. As an example, the count is {count}, {count} and{" "}
              {count}.
            </Translate>
          </>
        );
      }
      
      export default App;
    `,
  );

  fs.writeFileSync(
    resolveProjectPath("src/second.tsx"),
    `
      import { 
        Translate as VeryLongImportedNamedComponent 
      } from "react-dialect";

      export default function Second() {
        return (
          <div>
            <VeryLongImportedNamedComponent>
              Sanity check for translations in multiple files
            </VeryLongImportedNamedComponent>
          </div>
        );
      }
    `,
  );
});

test.after.always(() => {
  fs.rmSync(PROJECT_ROOT, { recursive: true });
});

test("generates translations correctly", async (t) => {
  /** @type CliConfig */
  const config = { $cwd: PROJECT_ROOT };

  await generate(config);

  const expectedFiles = [
    { language: "French", filePath: resolveProjectPath("public/locales/fr.json") },
    { language: "German", filePath: resolveProjectPath("public/locales/ge.json") },
  ];

  const expectedKeys = [
    "Next gen translation library",
    "It supports interpolation like so: {count}",
    "Even with long paragraph statements that get formatted into multiple lines with tools like Prettier, react-dialect just works.",
    "Even better, long paragraph statements that get reformatted can still contain interpolated values like so: {count} and a second like so: {name} and still be parsed by react-dialect",
    "React dialect can even replace the same value interpolated multiple times in a string. As an example, the count is {count}, {count} and {count}.",
    "Sanity check for translations in multiple files",
  ];

  for (const { language, filePath } of expectedFiles) {
    t.true(fs.existsSync(filePath), `${language} translations missing`);
    const keys = Object.keys(JSON.parse(fs.readFileSync(filePath, { encoding: "utf-8" })));
    t.deepEqual(keys, expectedKeys, `Translation keys in ${language}.json don't match`);
  }
});
