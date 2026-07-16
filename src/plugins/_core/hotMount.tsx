/*
 * Revcord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { CommandPaletteModal } from "@components/CommandPaletteModal";
import { DevOverlayPanel } from "@components/DevOverlayPanel";
import { Devs } from "@utils/constants";
import { Logger } from "@utils/Logger";
import definePlugin from "@utils/types";
import { createRoot, React } from "@webpack/common";
import type { Root } from "react-dom/client";

const logger = new Logger("HotMount", "#a6e3a1");

let root: Root | null = null;
let host: HTMLDivElement | null = null;

function mount() {
    if (root) return;
    host = document.createElement("div");
    host.id = "revcord-ui-root";
    host.style.position = "fixed";
    host.style.inset = "0";
    host.style.pointerEvents = "none";
    host.style.zIndex = "2147483646";
    document.body.appendChild(host);

    root = createRoot(host);
    root.render(
        <React.Fragment>
            <CommandPaletteModal />
            <DevOverlayPanel />
        </React.Fragment>
    );
    logger.info("Mounted Revcord UI root");
}

function unmount() {
    root?.unmount();
    root = null;
    host?.remove();
    host = null;
}

export default definePlugin({
    name: "HotMount",
    description: "Mounts Revcord's overlay UI (Command Palette + Dev Overlay) into the Discord DOM",
    authors: [Devs.Ven],
    required: true,

    start() {
        if (document.body) {
            mount();
        } else {
            const obs = new MutationObserver(() => {
                if (document.body) {
                    mount();
                    obs.disconnect();
                }
            });
            obs.observe(document.documentElement, { childList: true, subtree: true });
        }

        window.addEventListener("beforeunload", unmount);
    },

    stop() {
        unmount();
    }
});
