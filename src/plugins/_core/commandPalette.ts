/*
 * Revcord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { CommandPalette } from "@api/CommandPalette";
import { CommandRegistry } from "@api/CommandRegistry";
import { Devs } from "@utils/constants";
import { Logger } from "@utils/Logger";
import definePlugin from "@utils/types";

const logger = new Logger("CommandPalette", "#cba6f7");

export default definePlugin({
    name: "CommandPalette",
    description: "Opens a searchable command palette with Ctrl/⌘+K. Powered by Revcord's CommandRegistry.",
    authors: [Devs.Ven],
    required: true,

    start() {
        CommandRegistry.register({
            name: "revcord:reload-all",
            description: "Hot-reload all reloadable Revcord targets",
            owner: this.name,
            category: "Revcord",
            execute: async () => {
                const { HotReload } = await import("@api/HotReload");
                await HotReload.reloadAll();
                return "Reloaded all targets";
            }
        });
        CommandRegistry.register({
            name: "revcord:open-palette",
            description: "Open the command palette",
            owner: this.name,
            category: "Revcord",
            execute: () => { CommandPalette.open(); }
        });

        const onKey = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                CommandPalette.toggle();
            }
        };
        window.addEventListener("keydown", onKey);
    }
});
