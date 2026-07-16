/*
 * Revcord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { EventBus } from "@api/EventBus";
import { definePluginSettings,Settings } from "@api/Settings";
import { Devs } from "@utils/constants";
import { Logger } from "@utils/Logger";
import definePlugin, { OptionType } from "@utils/types";
import { showToast, Toasts } from "@webpack/common";

const logger = new Logger("SafeMode", "#e78284");

const CRASH_THRESHOLD = 3;
const WINDOW_MS = 60_000;

const settings = definePluginSettings({
    autoQuarantine: {
        type: OptionType.BOOLEAN,
        description: "Automatically disable plugins that crash on startup so they can't trap you in a crash loop",
        default: true
    },
    notify: {
        type: OptionType.BOOLEAN,
        description: "Show a toast when a plugin is quarantined",
        default: true
    }
});

// name -> timestamps of recent crashes
const crashLog = new Map<string, number[]>();
let engaged = false;

function recordCrash(name: string): number[] {
    const now = Date.now();
    const times = (crashLog.get(name) ?? []).filter(t => now - t < WINDOW_MS);
    times.push(now);
    crashLog.set(name, times);
    return times;
}

export default definePlugin({
    name: "SafeMode",
    description: "Protects you from crash loops by quarantining plugins that repeatedly fail to start",
    authors: [Devs.Ven],
    required: true,

    settings,

    start() {
        EventBus.on("plugin:error", ({ name, stage }) => {
            if (stage !== "start") return;
            if (!settings.store.autoQuarantine) return;

            const times = recordCrash(name);
            if (times.length < CRASH_THRESHOLD) return;

            engaged = true;
            crashLog.delete(name);

            try {
                // Disable the offending plugin so it won't load on next start
                if (Settings.plugins[name]) {
                    Settings.plugins[name].enabled = false;
                }
            } catch { /* settings not ready, ignore */ }

            if (settings.store.notify) {
                showToast(`Revcord disabled "${name}" — it kept crashing on startup`, Toasts.Type.FAILURE);
            }

            EventBus.emit("safemode:engage", { crashes: times.length, crashLoop: [name] });
            logger.warn(`Quarantined plugin "${name}" after ${times.length} startup crashes`);
        });

        EventBus.on("safemode:dismiss", () => {
            engaged = false;
        });
    }
});

export const isSafeModeEngaged = () => engaged;
