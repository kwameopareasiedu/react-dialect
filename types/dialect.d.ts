interface DialectConfig {
  roots: string[];
  languages: string[];
  base: string;
}

interface TranslationEntry {
  key: string[];
  type: "static" | "variable";
}

interface KeyToken {
  type: "static" | "variable";
  value: string;
}
