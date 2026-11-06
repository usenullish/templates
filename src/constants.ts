export type Language = "en" | "fr" | "de" | "it";

export const DEFAULT_LANGUAGE = "en";

export const LANGUAGES: { lang: Language; label: string }[] = [
  { lang: DEFAULT_LANGUAGE, label: "English" },
  { lang: "fr", label: "Français" },
  { lang: "de", label: "Deutsch" },
  { lang: "it", label: "Italiano" },
];
