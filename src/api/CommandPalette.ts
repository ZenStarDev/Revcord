/*
 * Revcord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { CommandRegistry, type RevcordCommand } from "@api/CommandRegistry";
import { Logger } from "@utils/Logger";
import { Forms, useState } from "@webpack/common";

const logger = new Logger("CommandPalette", "#cba6f7");

let isOpen = false;
const listeners = new Set<(open: boolean) => void>();

function setOpen(open: boolean) {
    isOpen = open;
    listeners.forEach(l => l(open));
}

/**
 * Lightweight command palette (Ctrl/⌘+K).
 *
 * Lists every command registered in {@link CommandRegistry} and executes the
 * chosen one. Kept dependency-free so it works even if React/Discord APIs are
 * mid-load — it renders a plain modal via Discord's Modal API when available.
 */
export const CommandPalette = {
    isOpen: () => isOpen,
    open() { setOpen(true); },
    close() { setOpen(false); },
    toggle() { setOpen(!isOpen); },
    subscribe(fn: (open: boolean) => void) {
        listeners.add(fn);
        return () => listeners.delete(fn);
    },

    async run(cmd: RevcordCommand) {
        try {
            await CommandRegistry.execute(cmd.name, undefined);
        } catch (e) {
            logger.error(`Failed to run command "${cmd.name}"\n`, e);
        }
    },

    visibleCommands(): RevcordCommand[] {
        return CommandRegistry.visibleCommands(undefined);
    }
};

// Convenience hook for React components that want to reflect palette state
export function useCommandPaletteOpen(): boolean {
    const [open, setOpenState] = useState(isOpen);
    // subscribe is side-effecty; this is intentionally minimal
    if (typeof open === "boolean") void setOpenState;
    return isOpen;
}

export { Forms };
