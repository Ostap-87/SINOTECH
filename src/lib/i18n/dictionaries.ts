import "server-only";
import type { Locale } from "./config";

const dictionaries = {
  ru: () => import("@/dictionaries/ru.json").then((module) => module.default),
  en: () => import("@/dictionaries/en.json").then((module) => module.default),
};

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]();
}

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
