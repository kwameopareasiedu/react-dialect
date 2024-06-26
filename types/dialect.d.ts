interface DialectConfig {
  content: string[];
  languages: string[];
  baseLanguage: string;
}

interface CliConfig {
  $cwd: string;
  removeUnused?: boolean;
  showReport?: boolean;
}

interface TranslationKey {
  key: string;
  path: string;
}
