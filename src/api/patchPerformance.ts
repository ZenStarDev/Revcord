/*
 * Revcord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { canonicalizeFind, canonicalizeReplacement } from "@utils/patches";
import type { Patch, PatchReplacement } from "@utils/types";

const findCache = new WeakMap<object, string>();
const replaceCache = new WeakMap<object, string | RegExp>();

/**
 * Performance helper for the patcher.
 *
 * `canonicalizeFind` / `canonicalizeReplacement` mutate their argument in
 * place but do non-trivial string work. We memoize the *result* per-patch so
 * re-applying (e.g. on hot reload or repeated module loads) is essentially free.
 */
export function memoizedCanonicalFind(patch: Patch): string {
    let cached = findCache.get(patch);
    if (cached === undefined) {
        canonicalizeFind(patch);
        cached = typeof patch.find === "string" ? patch.find : patch.find.source;
        findCache.set(patch, cached);
    }
    return cached;
}

export function memoizedCanonicalReplacement(replacement: PatchReplacement, pluginPath: string): string | RegExp {
    let cached = replaceCache.get(replacement);
    if (cached === undefined) {
        canonicalizeReplacement(replacement, pluginPath);
        const value = (replacement as any).replace;
        cached = (typeof value === "string" || value instanceof RegExp) ? value : String(value);
        replaceCache.set(replacement, cached);
    }
    return cached;
}
