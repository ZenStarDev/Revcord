/*
 * Revcord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { plugin } from "@api/PluginSDK";
import { OptionType } from "@utils/types";

export default plugin("Example Commands", "Registers helpful slash-style and palette commands")
    .by("You", "123456789012345678")
    .command({
        name: "ping",
        description: "Reply with pong (latency)",
        category: "Fun",
        run: () => "pong 🏓"
    })
    .command({
        name: "revcord-version",
        description: "Print the running Revcord version",
        category: "Revcord",
        run: () => `Revcord ${VERSION}`
    })
    .setting("announceInChat", {
        type: OptionType.BOOLEAN,
        description: "Show a confirmation toast when a command runs",
        default: true
    })
    .patch({
        find: "EXAMPLE_FIND_STRING",
        replace: "EXAMPLE_REPLACEMENT",
        noWarn: true
    })
    .start(() => console.log("[Example Commands] started"))
    .build();
