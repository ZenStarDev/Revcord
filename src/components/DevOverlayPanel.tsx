/*
 * Revcord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { EventBus } from "@api/EventBus";
import { type LogEntry,Loggers } from "@api/Loggers";
import { useState } from "@webpack/common";

const MAX_LINES = 200;

/**
 * Small floating dev overlay: a runtime health indicator plus a live tail of
 * Revcord's central log stream. Only mounted in DEV builds (or when the user
 * enables capture), so it never ships to normal users.
 */
export function DevOverlayPanel() {
    const [entries, setEntries] = useState<readonly LogEntry[]>([]);
    const [ok, setOk] = useState(true);
    const [reason, setReason] = useState<string | undefined>();

    if (!IS_DEV && !Loggers.isCapturing()) return null;

    // Subscribe once
    if (entries.length === 0) {
        Loggers.setCapture(true);
        EventBus.on("status:change", ({ ok, reason }) => {
            setOk(ok);
            setReason(reason);
        });
        setEntries(Loggers.getHistory().slice(-MAX_LINES));
        // Lightweight polling is fine for a dev overlay
        setInterval(() => setEntries(Loggers.getHistory().slice(-MAX_LINES)), 1000);
    }

    const color = ok ? "#a6d189" : "#e78284";

    return (
        <div style={{
            position: "fixed", bottom: 8, left: 8, width: 360, maxHeight: 220,
            overflowY: "auto", pointerEvents: "auto",
            background: "rgba(0,0,0,0.75)", color: "#cdd6f4",
            fontFamily: "monospace", fontSize: 11, borderRadius: 8, padding: 8,
            zIndex: 2147483647
        }}>
            <div style={{ color, fontWeight: "bold", marginBottom: 4 }}>
                ● Revcord {ok ? "healthy" : "degraded"}{reason ? ` — ${reason}` : ""}
            </div>
            {entries.map((e, i) => (
                <div key={i} style={{ opacity: 0.85, whiteSpace: "pre-wrap" }}>
                    <span style={{ opacity: 0.5 }}>{new Date(e.ts).toLocaleTimeString()}</span>{" "}
                    <span style={{ color }}>{e.level}</span>{" "}
                    <span style={{ color: "#89b4fa" }}>[{e.logger}]</span>{" "}
                    {String(e.args[0] ?? "")}
                </div>
            ))}
        </div>
    );
}
