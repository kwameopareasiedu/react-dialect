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

## Contributors

- [Kwame Opare Asiedu](https://github.com/kwameopareasiedu)
