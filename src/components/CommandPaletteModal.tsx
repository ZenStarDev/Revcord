/*
 * Revcord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { CommandPalette } from "@api/CommandPalette";
import type { RevcordCommand } from "@api/CommandRegistry";
import { Forms, useEffect, useState } from "@webpack/common";

function CommandRow({ cmd, onPick }: { cmd: RevcordCommand; onPick: () => void; }) {
    return (
        <div
            role="button"
            style={{ padding: "8px 12px", borderRadius: 8, cursor: "pointer" }}
            onClick={onPick}
            onMouseEnter={onPick}
        >
            <Forms.FormTitle tag="h5">{cmd.name}</Forms.FormTitle>
            <Forms.FormText>{cmd.description}</Forms.FormText>
            {cmd.category && (
                <Forms.FormText style={{ opacity: 0.6, fontSize: 12 }}>{cmd.category}</Forms.FormText>
            )}
        </div>
    );
}

/**
 * Render the command palette as a Discord modal. Mounted once by the
 * CommandPaletteInit plugin; subscribes to open/close state.
 */
export function CommandPaletteModal() {
    const [open, setOpen] = useState(CommandPalette.isOpen());
    const [query, setQuery] = useState("");
    const [active, setActive] = useState(0);

    useEffect(() => {
        const unsub = CommandPalette.subscribe(setOpen);
        return () => { unsub(); };
    }, []);
    useEffect(() => {
        setActive(0);
    }, [query, open]);

    if (!open) return null;

    const all = CommandPalette.visibleCommands();
    const filtered = query
        ? all.filter(c =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.description.toLowerCase().includes(query.toLowerCase())
        )
        : all;

    const pick = (cmd: RevcordCommand) => {
        CommandPalette.close();
        void CommandPalette.run(cmd);
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") { e.preventDefault(); setActive(i => Math.min(i + 1, filtered.length - 1)); }
        else if (e.key === "ArrowUp") { e.preventDefault(); setActive(i => Math.max(i - 1, 0)); }
        else if (e.key === "Enter") { e.preventDefault(); const cmd = filtered[active]; if (cmd) pick(cmd); }
        else if (e.key === "Escape") { e.preventDefault(); CommandPalette.close(); }
    };

    return (
        <div
            style={{
                position: "fixed", inset: 0, zIndex: 1000,
                background: "rgba(0,0,0,0.5)",
                display: "flex", alignItems: "flex-start", justifyContent: "center",
                paddingTop: "15vh"
            }}
            onClick={() => CommandPalette.close()}
        >
            <div
                style={{
                    width: 520, maxHeight: "60vh", overflowY: "auto",
                    background: "var(--background-secondary)", borderRadius: 12, padding: 12,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.4)"
                }}
                onClick={e => e.stopPropagation()}
                onKeyDown={onKeyDown}
            >
                <input
                    autoFocus
                    placeholder="Type a command…"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    style={{
                        width: "100%", padding: "10px 12px", borderRadius: 8, border: "none",
                        background: "var(--background-tertiary)", color: "var(--text-normal)", fontSize: 15
                    }}
                />
                <div style={{ marginTop: 8 }}>
                    {filtered.length === 0 && (
                        <Forms.FormText style={{ padding: 12, opacity: 0.6 }}>No commands found</Forms.FormText>
                    )}
                    {filtered.map((cmd, i) => (
                        <div
                            key={cmd.name}
                            style={{ background: i === active ? "var(--background-modifier-hover)" : "transparent", borderRadius: 8 }}
                            onMouseEnter={() => setActive(i)}
                        >
                            <CommandRow cmd={cmd} onPick={() => pick(cmd)} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
