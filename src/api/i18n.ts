/*
 * Revcord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export type TranslationDict = Record<string, string>;

const dictionaries = new Map<string, TranslationDict>();
const fallbackOrder: string[] = ["en-US", "en"];
let currentLocale = "en-US";

/**
 * Lightweight i18n for Revcord core and plugins.
 *
 * - Register a dictionary per locale with {@link addTranslations}.
 * - Look strings up with {@link t} — missing keys fall back to the source
 *   language, then to the key itself, so the UI never throws or renders blanks.
 * - Supports `{name}` style interpolation.
 */
export const i18n = {
    get locale() {
        return currentLocale;
    },
    setLocale(locale: string) {
        currentLocale = locale;
    },
    getFallbackLocales(): readonly string[] {
        return fallbackOrder;
    },
    addTranslations(locale: string, dict: TranslationDict) {
        const existing = dictionaries.get(locale) ?? {};
        dictionaries.set(locale, { ...existing, ...dict });
    },
    has(locale: string, key: string): boolean {
        return Boolean(dictionaries.get(locale)?.[key]);
    },
    translate(locale: string, key: string, vars?: Record<string, string | number>): string {
        const dict = dictionaries.get(locale);
        let value = dict?.[key];

        if (value == null) {
            for (const fb of fallbackOrder) {
                const fbDict = dictionaries.get(fb);
                if (fbDict?.[key] != null) {
                    value = fbDict[key];
                    break;
                }
            }
        }

        if (value == null) return key;

        if (vars) {
            for (const [k, v] of Object.entries(vars)) {
                value = value.replaceAll(`{${k}}`, String(v));
            }
        }
        return value;
    }
};

/** Translate `key` in the active locale (with interpolation). */
export function t(key: string, vars?: Record<string, string | number>): string {
    return i18n.translate(currentLocale, key, vars);
}
