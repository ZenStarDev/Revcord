/*
 * Revcord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Logger } from "@utils/Logger";

const logger = new Logger("HotReload", "#fab387");

export interface HotReloadTarget {
    id: string;
    reload(): void | Promise<void>;
}

const targets = new Map<string, HotReloadTarget>();

/**
 * Registry that lets pieces of Revcord (or plugins with native backends)
 * declare that they can be re-initialised without a full client restart.
 *
 * The Settings / Command Palette UIs call {@link HotReload.requestReload} so a
 * user can apply big changes instantly instead of relaunching Discord.
 */
export const HotReload = {
    register(target: HotReloadTarget) {
        targets.set(target.id, target);
        logger.debug("Registered hot-reload target", target.id);
    },
    unregister(id: string) {
        targets.delete(id);
    },
    list(): string[] {
        return [...targets.keys()];
    },
    async requestReload(id: string) {
        const target = targets.get(id);
        if (!target) {
            logger.warn(`HotReload target not found: ${id}`);
            return false;
        }
        try {
            await target.reload();
            logger.info(`Hot-reloaded ${id}`);
            return true;
        } catch (e) {
            logger.error(`Failed to hot-reload ${id}\n`, e);
            return false;
        }
    },
    async reloadAll() {
        for (const id of this.list()) await this.requestReload(id);
    }
};
