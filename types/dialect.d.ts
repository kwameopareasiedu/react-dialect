interface DialectConfig {
  content: string[];
  languages: string[];
  baseLanguage: string;
}

interface CliConfig {
  $cwd: string;
  removeUnused?: boolean;
}
