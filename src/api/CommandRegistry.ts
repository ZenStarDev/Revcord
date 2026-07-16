/*
 * Revcord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { EventBus } from "@api/EventBus";
import { Logger } from "@utils/Logger";

const logger = new Logger("CommandRegistry", "#94e2d5");

export interface RevcordCommand {
    name: string;
    description: string;
    owner: string;
    category?: string;
    aliases?: string[];
    predicate?: (ctx: unknown) => boolean;
    execute: (ctx: unknown) => unknown | Promise<unknown>;
}

const commands = new Map<string, RevcordCommand>();

/**
 * A central, Discord-independent command registry.
 *
 * While `@api/Commands` registers slash-style commands into Discord's own
 * command system, this registry is Revcord's own — it powers the Command
 * Palette and lets plugins expose actions that don't need a chat context.
 */
export const CommandRegistry = {
    register(cmd: RevcordCommand): void {
        if (commands.has(cmd.name)) {
            logger.warn(`Command "${cmd.name}" already registered, overwriting`);
        }
        commands.set(cmd.name, cmd);
        EventBus.emit("command:register", { name: cmd.name, owner: cmd.owner });
    },
    unregister(name: string): void {
        const cmd = commands.get(name);
        if (!cmd) return;
        commands.delete(name);
        EventBus.emit("command:unregister", { name, owner: cmd.owner });
    },
    get(name: string): RevcordCommand | undefined {
        return commands.get(name);
    },
    all(): RevcordCommand[] {
        return [...commands.values()];
    },
    /** Commands visible to `ctx`, grouped by category (for the palette). */
    visibleCommands(ctx: unknown): RevcordCommand[] {
        return this.all().filter(c => !c.predicate || c.predicate(ctx));
    },
    async execute(name: string, ctx: unknown): Promise<unknown> {
        const cmd = commands.get(name);
        if (!cmd) {
            logger.warn(`Tried to execute unknown command "${name}"`);
            return undefined;
        }
        try {
            return await cmd.execute(ctx);
        } catch (e) {
            logger.error(`Command "${name}" threw:\n`, e);
            throw e;
        }
    }
};
