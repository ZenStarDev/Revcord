/*
 * Revcord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { EventBus } from "@api/EventBus";

export type LogLevel = "log" | "info" | "warn" | "error" | "debug";

export interface LogEntry {
    ts: number;
    logger: string;
    level: LogLevel;
    args: unknown[];
}

const registry = new Map<string, unknown>();
const history: LogEntry[] = [];
const MAX_HISTORY = 500;

let captureEnabled = false;

function pushHistory(entry: LogEntry) {
    if (!captureEnabled) return;
    history.push(entry);
    if (history.length > MAX_HISTORY) history.shift();
}

/**
 * Central registry of all {@link Logger} instances created across Revcord.
 *
 * Plugin authors still create their own `new Logger(name)`, but every emit is
 * also funnelled through here so tooling (the dev overlay, crash reporter, etc.)
 * has a single source of truth for "what did Revcord just do".
 */
export const Loggers = {
    register(name: string, instance: unknown) {
        registry.set(name, instance);
    },
    get(name: string) {
        return registry.get(name);
    },
    all(): Map<string, unknown> {
        return registry;
    },

    /** Enable in-memory capture of log entries (for the dev overlay). */
    setCapture(enabled: boolean) {
        captureEnabled = enabled;
        if (!enabled) history.length = 0;
    },
    isCapturing() {
        return captureEnabled;
    },
    getHistory(): readonly LogEntry[] {
        return history;
    },

    record(level: LogLevel, loggerName: string, args: unknown[]) {
        const entry: LogEntry = { ts: Date.now(), logger: loggerName, level, args };
        pushHistory(entry);
        if (level === "error") {
            EventBus.emit("status:change", { ok: false, reason: `${loggerName}: ${String(args[0] ?? "")}` });
        }
    }
};
