# React Dialect

A next-gen translation library for React

## Features

- An easier mental model for translations instead of cumbersome translation keys.

  No more back and forth to the translation file to know the exact text in a tag.

  ```typescript jsx
  {/** Use this */}
  <Translate component="p" className="w-auto text-center">
    The quick brown fox jumped over the lazy dog
  <Translate/>
  
  {/** instead of this */}
  <p className="w-auto text-center">
    {t("translation-key")}
  </p>
  ```
- Build translations configuration using a simple CLI command
  ```shell
  react-dialect build
  ```
  
  This creates the necessary configuration and translation files

## Contributors

- [Kwame Opare Asiedu](https://github.com/kwameopareasiedu)
