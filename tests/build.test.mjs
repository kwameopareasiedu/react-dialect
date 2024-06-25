import test from "ava";
import * as fs from "fs";
import path from "path";

const PROJECT_ROOT = path.resolve(__dirname, "sample");

/** @param {string} segment */
function resolveProjectPath(segment) {
  return path.resolve(PROJECT_ROOT, segment);
}

test.before(async () => {
  // Setup test project directory

  if (fs.existsSync(PROJECT_ROOT)) {
    // Clear sample project directory
    fs.rmSync(PROJECT_ROOT, { recursive: true });
  }

  // Create dialect config file
  fs.writeFileSync(
    resolveProjectPath("dialect.config.json"),
    `
    {
      "content": ["src"],
      "languages": ["en", "fr", "ge"],
      "baseLanguage": "en"
    }
    `
  );

  // Create sourceFile config file
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
    `
  );

  // Create sourceFile config file
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
    `
  );
});

test.after.always(async () => {});

test("ava works", (t) => {
  t.is(true, true);
});
