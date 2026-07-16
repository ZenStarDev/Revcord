/*
 * Revcord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { plugin } from "@api/PluginSDK";
import { OptionType } from "@utils/types";

export default plugin("Example Hello", "A tiny example plugin built with the Revcord SDK")
    .by("You", "123456789012345678")
    .command({
        name: "hello",
        description: "Say hello from Revcord",
        run: () => {
            alert("Hello from Revcord! 🎉");
            return "said hi";
        }
    })
    .stylesheet(`
        /* Example: tint the app background slightly */
        [class*="app"] { /* background: rgba(137,180,250,0.04); */ }
    `)
    .setting("greeting", {
        type: OptionType.STRING,
        description: "What to say",
        default: "Hello from Revcord! 🎉",
        placeholder: "Type a greeting…"
    })
    .start(() => console.log("[Example Hello] started"))
    .build();
