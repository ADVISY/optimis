import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

import fr from "@/i18n/locales/fr.json";
import de from "@/i18n/locales/de.json";
import itLocale from "@/i18n/locales/it.json";

type AnyRecord = Record<string, any>;

function listFilesRecursive(dir: string, exts: string[], acc: string[] = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      listFilesRecursive(full, exts, acc);
      continue;
    }
    if (exts.some((ext) => entry.name.endsWith(ext))) acc.push(full);
  }
  return acc;
}

function getByPath(obj: AnyRecord, keyPath: string) {
  return keyPath.split(".").reduce<any>((cur, k) => (cur == null ? undefined : cur[k]), obj);
}

function extractTranslationKeysFromSource(source: string) {
  // Captures: t("some.key"), t('some.key'), t(`some.key`)
  const re = /\bt\(\s*(["'`])([^"'`]+)\1/g;
  const keys = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(source))) {
    const key = m[2].trim();
    if (key.startsWith("forms.") || key.startsWith("comparison.")) {
      keys.add(key);
    }
  }
  return [...keys];
}

describe("i18n (forms): no missing keys", () => {
  it("all forms/comparison translation keys exist in fr/de/it", () => {
    const roots = [
      path.join(process.cwd(), "src/components/forms"),
      path.join(process.cwd(), "src/hooks"),
    ];

    const files = roots.flatMap((root) =>
      fs.existsSync(root) ? listFilesRecursive(root, [".ts", ".tsx"]) : []
    );

    const allKeys = new Set<string>();
    for (const file of files) {
      const src = fs.readFileSync(file, "utf8");
      for (const k of extractTranslationKeysFromSource(src)) allKeys.add(k);
    }

    const resources = {
      fr: fr as AnyRecord,
      de: de as AnyRecord,
      it: itLocale as AnyRecord,
    };

    const missing: Record<string, string[]> = { fr: [], de: [], it: [] };
    for (const key of allKeys) {
      for (const lang of Object.keys(resources) as Array<keyof typeof resources>) {
        if (getByPath(resources[lang], key) === undefined) missing[lang].push(key);
      }
    }

    const messages = Object.entries(missing)
      .filter(([, arr]) => arr.length)
      .map(([lang, arr]) => `${lang}: ${arr.sort().join(", ")}`)
      .join("\n");

    expect(messages).toBe("");
  });
});
