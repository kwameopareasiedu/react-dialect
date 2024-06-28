# React Dialect

A next-gen internationalization (i18n) library for React with minimal configuration.

[![CircleCI](https://dl.circleci.com/status-badge/img/circleci/FMBebRNnfb6DvNimhnN8hn/B12wdgBr28egU2dW897acs/tree/master.svg?style=svg&circle-token=CCIPRJ_Uj9rEgMxqL9qmCdG9NBRHu_70f14e002a2479d29d163bea1e256d08f5eee7cb)](https://dl.circleci.com/status-badge/redirect/circleci/FMBebRNnfb6DvNimhnN8hn/B12wdgBr28egU2dW897acs/tree/master) 
![License](https://img.shields.io/badge/License-MIT-orange)
![Size](https://img.shields.io/badge/Unpacked_Size-30kB-blue)
[![Static Badge](https://img.shields.io/badge/Buy_Me_A_Coffee-yellow?style=flat&logo=buymeacoffee&labelColor=orange&color=orange)](https://www.buymeacoffee.com/kwameopareasiedu)

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
npx react-dialect generate
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

### Intuitive Translate Tags

Use natural language in the `Translate` tags without the overhead of managing and looking up values for keys.
The `Translate` component is polymorphic meaning its props are control by the value of the `as` prop

```typescript jsx
// Natually written JSX strings ✅
<Translate as="p">I love react-dialect</Translate>
<Translate as={Link} to="/profile">Go to profile</Translate>

// Not function calling with keys ❌
<p>{t("loveForReactDialect")}</p>
<Link to="/profile">{t("goToProfile")}</Link>
```

### Automatic Translation Keys Generation

`React-dialect` comes with a CLI function which analyzes your source code, looking for instances of the
`<Translate></Translate>` component and the `translate()` hook function. From these, it generates translation keys
automatically and writes them to your translation files, located in `/public/locales`.

- Use the `--remove-unused` flag to remove translation keys which don't exist in your source code anymore
- Use the `--show-report` flag to output new translation keys found after execution

```shell
npx react-dialect generate
#or
npx react-dialect generate --remove-unused
#or
npx react-dialect generate --show-report
```

> _Multiline code strings are converted to single line strings, so using Prettier to format your code isn't an issue._

### Seamless Variable Interpolation

Want to insert values into your translations? **The same JSX syntax just works** with no extra effort!

```typescript jsx
const [name, setName] = useState("Kwame Opare Asiedu");
const [year, setYear] = useState(2024);
// Ommited component code
<Translate>My name is {name} and the year is {year}</Translate> // It just works!
```

During generation, `react-dialect` includes variable placeholders in the translation keys. Just use the same
placeholders in the translations and you are good to go. The translation key-value pair for the example above for
French would be:

```json
{
  "My name is {name} and the year is {year}": "Je m'appelle {name} et l'année est {year}"
}
```

### Lazy Loading Of Translations

`React-dialect` will only fetch the translation file for a language when it is first chosen either by the
`SwitchLanguage` component of the `setCurrentLanguage()` hook function. The translations are cached in memory and are
not re-fetched anytime the language is selected.

This gives the following benefits:

1. Translation files are not bundled with your application's source code hence keeping your bundles small.
2. **Zero** load times for base translations, since those are the children of the `Translate` components.

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
- [x] Implement a CLI to statically analyze source code and generate translation keys ✅
  - [x] Parse instances of `<Translate>` component, whether imported as default or with an alias ✅
  - [x] Parse instances of `translate` function, whether used with default name or destructured with an alias ✅
  - [x] Merge new keys into existing translations files ✅
  - [x] Optionally remove unused keys (I.e. keys not found in source code) with `--remove-unused` flag ✅
  - [x] Optionally display a report of new keys found along with their file paths with `--show-report` flag ✅
- [x] Implement a customizable `SwitchLanguage` component ✅
- [x] Generate appropriate type declarations ✅
- [ ] Implement JSX parsing in `Translate` component (Coming soon)
- [ ] Provide a service to get values for translation keys (Coming soon)

## Supporting

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/kwameopareasiedu)

Your support would mean so much and keep the motivation going. Thanks 🤗

## Contributors

- [Kwame Opare Asiedu](https://github.com/kwameopareasiedu) (Author)
