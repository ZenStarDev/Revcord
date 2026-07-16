/*
 * Revcord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { EventBus } from "@api/EventBus";
import { Logger } from "@utils/Logger";

const logger = new Logger("Lifecycle", "#f5c2e7");

export type LifecycleHook = () => void | Promise<void>;

/**
 * Register global lifecycle hooks for your plugin *without* needing to be a
 * full `definePlugin`. This is the recommended way for small pieces of code
 * (e.g. user scripts, dev helpers) to hook into Revcord's start/stop cycle.
 */
export const Lifecycle = {
    _onStart: new Set<LifecycleHook>(),
    _onStop: new Set<LifecycleHook>(),

    /** Run `fn` once Revcord has finished starting every plugin. */
    onReady(fn: LifecycleHook) {
        this._onStart.add(fn);
        return () => this._onStart.delete(fn);
    },
    /** Run `fn` when Revcord is about to tear down (e.g. safe-mode, reload). */
    onStop(fn: LifecycleHook) {
        this._onStop.add(fn);
        return () => this._onStop.delete(fn);
    },

    async _runStart() {
        for (const fn of [...this._onStart]) {
            try {
                await fn();
            } catch (e) {
                logger.error("Lifecycle onReady hook threw:\n", e);
            }
        }
        EventBus.emit("app:ready", {});
    },
    async _runStop() {
        for (const fn of [...this._onStop]) {
            try {
                await fn();
            } catch (e) {
                logger.error("Lifecycle onStop hook threw:\n", e);
            }
        }
    }
};
