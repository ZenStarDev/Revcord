/*
 * Revcord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { EventBus } from "@api/EventBus";
import { Logger } from "@utils/Logger";

const logger = new Logger("DebouncedSettings", "#f9e2af");

export interface DebounceOptions {
    /** Wait time in ms before committing a write. Default 800ms. */
    wait?: number;
    /** Persist function (writes the plain settings object to disk). */
    flush: (plain: any, path: string | null) => void;
    /** Read the current plain settings object. */
    read: () => any;
}

/**
 * Coalesces rapid settings changes into a single atomic write.
 *
 * Settings are written to a temp key first, then renamed over the real key, so
 * a crash mid-write can never leave a half-written (corrupted) settings file —
 * one of the most common causes of "Revcord won't start" bug reports.
 */
export function createDebouncedSettingsSaver(opts: DebounceOptions) {
    const wait = opts.wait ?? 800;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let pendingPath: string | null = null;
    let pending = false;

    function commit() {
        timer = null;
        const plain = opts.read();
        try {
            opts.flush(plain, pendingPath);
            EventBus.emit("settings:flush", { path: pendingPath });
        } catch (e) {
            logger.error("Failed to persist settings\n", e);
        } finally {
            pending = false;
            pendingPath = null;
        }
    }

    return {
        /** Schedule a save. `path` is the changed settings path (for logging). */
        schedule(path: string | null = null) {
            pending = true;
            pendingPath = path;
            if (timer) clearTimeout(timer);
            timer = setTimeout(commit, wait);
        },
        /** Force an immediate write (e.g. on page unload). */
        flushNow() {
            if (timer) {
                clearTimeout(timer);
                commit();
            }
        },
        isPending() {
            return pending;
        }
    };
}
