interface DialectConfig {
  content: string[];
  languages: string[];
  baseLanguage: string;
}

interface CliConfig {
  removeUnused?: boolean;
}

interface TranslationEntry {
  key: string[];
  type: "static" | "variable";
}

interface KeyToken {
  type: "static" | "variable";
  value: string;
}
