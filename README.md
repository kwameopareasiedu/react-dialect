# React Dialect

A next-gen internationalization (i18n) library for React with minimal configuration.

[![CircleCI](https://dl.circleci.com/status-badge/img/circleci/FMBebRNnfb6DvNimhnN8hn/B12wdgBr28egU2dW897acs/tree/master.svg?style=svg&circle-token=CCIPRJ_Uj9rEgMxqL9qmCdG9NBRHu_70f14e002a2479d29d163bea1e256d08f5eee7cb)](https://dl.circleci.com/status-badge/redirect/circleci/FMBebRNnfb6DvNimhnN8hn/B12wdgBr28egU2dW897acs/tree/master)

## Installation

```bash
# Yarn
yarn add --dev react-dialect

# NPM
npm i -D react-dialect
```

## Quick Comparison

_**Code without i18n**_

```typescript jsx
<span className="font-bold text-gray-400">Hello there!</span>

<p className="font-bold text-gray-600">My name is {name} and the year is {year}</p>

<Link to="/profile/about">My Profile</Link>
```

_**Code with react-i18next**_

`en.json` (Manually created)

```json
{
  "greeting": "Hello there!",
  "introduction": "My name is {{name}} and the year is {{year}}",
  "myProfile": "My Profile"
}
```

```typescript jsx
<span className="font-bold text-gray-400">{t("greeting")}</span>

<p className="font-bold text-gray-600">{t("introduction", { name, year })}</p>

<Link to="/profile/about">{t("myProfile")}</Link>
```

**Code with react-dialect**

```typescript jsx
<Translate as="span" className="font-bold text-gray-400">Hello there!</Translate>

<Translate as "p" className="font-bold text-gray-600">My name is {name} and the year is {year}</Translate>

<Translate as={Link} to="/profile/about">My Profile</Translate>
```

```bash
# Generate translation keys for specified languages (E.g. en.json, fr.json, etc)
# If translation files for languages already exist, new keys are merged into them
react-dialect generate
```

## Motivation & Goals

Calling translation functions in JSX (E.g. `<span>{t("greeting")}</span>`) is not quite intuitive. I've found myself
spending a good amount of time looking up values of translation keys. Also, for any text to be added, you'd have to
add keys and values to multiple translation files. This can be quite tasking for the average developer who wants to
build and awesome project

I know tools
like [i18next-scanner](http://i18next.github.io/i18next-scanner), [i18next-parser](https://github.com/i18next/i18next-parser)
and [babel-plugin-i18next-extract](https://github.com/gilbsgilbs/babel-plugin-i18next-extract) exist, but according
to [i18next](https://www.i18next.com/how-to/extracting-translations#id-1-adding-new-strings-manually), a lot of
developers still opt for manual creation.

I wanted an i18n solution where:

- Translation keys are automatically generated, so I don't have to think about them
- Variables are seamlessly interpolated into text without extra effort
- JSX is seamlessly parsed without extra effort

## Features

- Intuitive looking JSX in the base language
- Automatic generation of translation keys using `react-dialect generate`
  - Optionally remove unused translation keys to reduce bloat
- Variable interpolation works out of the box with no gimmicks
- Lazy loading of translation files to prevent large bundle sizes

## Quickstart

_Actually, this is all you need to do even for a production app_

1. Install using `yarn add --dev react-dialect` or `npm i -D react-dialect`

2. Create a `dialect.config.json` file in the root of your project
   ```json5
   {
     content: ["src"], // Root paths of source files (.js, .ts, .jsx, .tsx)
     languages: ["en", "fr", "ge"], // List of languages to support
     baseLanguage: "en", // Default language which must be part of "languages" array
   }
   ```
3. Wrap your app using `TranslationProvider`. The `languages` and `baseLanguage` props should be the same as in the
   `dialect.config.json`

   ```typescript jsx
   import {TranslationProvider} from "react-dialect";
   import App from "./App.tsx";

   ReactDOM.createRoot(document.getElementById("root")!).render(
    <TranslationProvider languages={["en", "fr", "ge"]} baseLanguage="en">
      <App />
    </TranslationProvider>,
   );
   ```

4. Use `Translate` component to display text. This uses `<p>` by default. Use the `as` prop to specify the root
   tag/component

   ```typescript jsx
   import { Translate as T, SwitchLanguage } from "react-dialect";
   import { Link } from "react-router-dom";

   const name = "Kwame Opare Asiedu";

   export default function Sub() {

      return (
         <div>
          <SwitchLanguage className="absolute top-4 left-4"/>
          <T as="p" className="font-bold">My name is {name}</T>
          <T as={Link} to="/profile">My profile</T>
        </div>
      );
   }
   ```

   > Note that at this point we haven't generated any translations, but the base text you typed _"My name is {name}"_
   > will be displayed in the browser when the app is run.

5. Generate translations for other languages using `npx react-dialect generate`. Translation files will be placed in the
   `/public/locales` directory.

6. Provide translations to the files in `public/locales` directory and switch the language

Congratulations! You've successfully integrated `react-dialect` into your workflow.

## Roadmap

- [x] Implement a **strongly typed** polymorphic `Translate` component to replace text tags ✅
- [ ] Implement a CLI to statically analyze source code and generate translation keys ✅
  - [x] Parse instances of `<Translate>` component, whether imported as default or with an alias ✅
  - [ ] Parse instances of `translate` function, whether used with default name or destructured with an alias
  - [x] Merge new keys into existing translations files ✅
  - [x] Optionally remove unused keys (I.e. keys not found in source code) with `--remove-unused` flag ✅
  - [x] Optionally display a report of new keys found along with their file paths with `--show-report` flag ✅
- [ ] Implement a customizable `SwitchLanguage` component
- [ ] Implement JSX parsing in `Translate` component
- [ ] Generate appropriate type declarations
- [ ] Provide a service to get values for translation keys

## Contributors

- [Kwame Opare Asiedu](https://github.com/kwameopareasiedu) (Author)
