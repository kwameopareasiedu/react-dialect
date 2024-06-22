# React Dialect

A next-gen translation library for React

## Features

- An easier mental model for translations instead of cumbersome translation keys.

  No more back and forth to the translation file to know the exact text in a tag.

  ```typescript jsx
  {/** Use this */}
  <Translate as="p" className="w-auto text-center">
    The quick brown fox jumped over the lazy dog
  <Translate/>

  {/** instead of this */}
  <p className="w-auto text-center">
    {t("brown-fox-pangram-key")}
  </p>
  ```

- Build translations configuration using a simple CLI command

  ```shell
  react-dialect build
  ```

  This analyzes your project and creates the necessary configuration and translation files

## Project Goals

1. [x] Provide a `Translate` component which is a polymorphic component, allowing custom components via the `as` prop.
2. [ ] Provide a CLI interface which analyzes the project from an entry point and creates the translation locales and
       other configuration.

## Build Process

1. Parse the `dialect.config.json` file
2. Recursively traverse the files in each directory path in the `content` array. For each file perform steps 3 to 8
3. Find either the default or aliased import statement for the `Translate` component from `react-dialect`.
4. Find all `<Translate>Lorem ipsum</Translate>` statements and extract the `children` string. _This will be the key
   for the translation_
   - If the `Translate` import was aliased (I.e. `import {Translate as Trans} from "react-dialect"`), find all
     `<Trans>Lorem ipsum</Trans>` instead
   - The extracted string can either be **static** (contain no interpolated variables) or **variable**
5. Clean up the extracted string by:

   - Replacing new lines with a whitespace
   - Replacing interpolated consecutive whitespaces (I.e `{" "}`) with a single one
   - Replace consecutive whitespaces with a single one

   At the end of this step, a string like;

   ```
     Lorem ipsum {count} dolor sit amet, consectetur adipisicing elit. Animi
     blanditiis, consectetur delectus deserunt dignissimos eius id in
     inventore ipsam iste minus, modi nam nihil non odio perspiciatis quas{" "}
     quo voluptate.
   ```

   would become;

   ```
   Lorem ipsum {count} dolor sit amet, consectetur adipisicing elit. Animi blanditiis, consectetur delectus deserunt dignissimos eius id in inventore ipsam iste minus, modi nam nihil non odio perspiciatis quas quo voluptate.
   ```

6. Create a key for the extracted string in the same way React parses `children` prop
   - For **static** strings, the key would be the text of the string in an array
     ```
     Source: <Translate>Hello world!</Translate>
     Key   : ["Hello world!"]
     ```
   - **Variable** strings are broken up at the interpolations and the segments become the key
     ```
     Source: <Translate>I am {userName} and I love coding!</Translate>
     Key   : ["I am ", "{userName}", " and I love coding!"]
     ```

## Contributors

- [Kwame Opare Asiedu](https://github.com/kwameopareasiedu)
