/*
 * Revcord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { CommandRegistry, type RevcordCommand } from "@api/CommandRegistry";
import { EventBus, type RevcordEventMap } from "@api/EventBus";
import { PlainSettings, Settings, useSettings } from "@api/Settings";
import { Logger } from "@utils/Logger";
import definePlugin, { OptionType, type PluginDef, type PluginSettingDef, type StartAt } from "@utils/types";

/* -------------------------------------------------------------------------- */
/*  Supreme Plugin SDK — build plugins faster than ever                        */
/* -------------------------------------------------------------------------- */

export interface AuthorInfo {
    name: string;
    id: string | number | bigint;
}

export interface CommandOptions {
    name: string;
    description: string;
    category?: string;
    aliases?: string[];
    predicate?: (ctx: unknown) => boolean;
    run: (ctx: unknown) => unknown | Promise<unknown>;
}

export interface PatchOptions {
    find: string | RegExp;
    replace: string | RegExp | ((match: string, ...groups: string[]) => string);
    all?: boolean;
    noWarn?: boolean;
    group?: boolean;
    predicate?: () => boolean;
}

export interface SettingOptions {
    type: OptionType;
    description: string;
    default?: any;
    displayName?: string;
    placeholder?: string;
    options?: { label: string; value: string | number | boolean; default?: boolean; }[];
    markers?: number[];
    multiline?: boolean;
    restartNeeded?: boolean;
    onChange?: (newValue: any) => void;
    hidden?: boolean | (() => boolean);
    disabled?: boolean | (() => boolean);
}

/**
 * A fluent, chainable builder for Revcord plugins.
 *
 * Compared to raw `definePlugin({...})`, this:
 *  - removes all the boilerplate (authors, required, start/stop plumbing)
 *  - gives you typed `.command()`, `.patch()`, `.stylesheet()`, `.setting()`,
 *    `.on()`, `.lifecycle()` helpers
 *  - auto-registers commands into the central {@link CommandRegistry}
 *  - auto-emits lifecycle events onto the {@link EventBus}
 *
 * @example
 * export default plugin("Hello World", "Says hi")
 *   .by("You", 123n)
 *   .command({ name: "hello", description: "Say hi", run: () => alert("hi") })
 *   .stylesheet(`[class*="app"] { outline: 2px solid rebeccapurple; }`)
 *   .build();
 */
export class PluginBuilder {
    private def: Partial<PluginDef> & {
        name: string;
        description: string;
        authors: AuthorInfo[];
        commands: any[];
        patches: any[];
        styles: string[];
        settingsDef: Record<string, PluginSettingDef>;
        flux: Record<string, (e: any) => void>;
        onStart?: () => void | Promise<void>;
        onStop?: () => void | Promise<void>;
    };

    constructor(name: string, description: string) {
        this.def = {
            name,
            description,
            authors: [],
            commands: [],
            patches: [],
            styles: [],
            settingsDef: {},
            flux: {}
        };
    }

    /** Add an author. `id` can be a number/bigint snowflake or a string handle. */
    by(name: string, id: string | number | bigint = name): this {
        this.def.authors.push({ name, id: BigInt(id.toString().replace(/\D/g, "") || "0") });
        return this;
    }

    /** Mark the plugin as required (force-enabled, hidden from the user). */
    required(): this {
        this.def.required = true;
        return this;
    }

    /** Hide the plugin from the plugin list. */
    hidden(): this {
        this.def.hidden = true;
        return this;
    }

    /** Enable the plugin by default. */
    enabledByDefault(): this {
        this.def.enabledByDefault = true;
        return this;
    }

    /** Run `start` at a specific lifecycle stage. */
    startAt(stage: StartAt): this {
        this.def.startAt = stage;
        return this;
    }

    /** Add a command (also registered in the central CommandRegistry). */
    command(opts: CommandOptions): this {
        this.def.commands.push({
            name: opts.name,
            description: opts.description,
            ...(opts.aliases ? { aliases: opts.aliases } : {}),
            ...(opts.predicate ? { predicate: opts.predicate } : {}),
            execute: opts.run
        });
        return this;
    }

    /** Add a webpack patch. */
    patch(opts: PatchOptions): this {
        const replacement = typeof opts.replace === "function"
            ? { match: opts.find, replace: opts.replace }
            : { match: opts.find, replace: opts.replace };

        this.def.patches.push({
            find: opts.find,
            replacement,
            ...(opts.all ? { all: opts.all } : {}),
            ...(opts.noWarn ? { noWarn: opts.noWarn } : {}),
            ...(opts.group ? { group: opts.group } : {}),
            ...(opts.predicate ? { predicate: opts.predicate } : {})
        });
        return this;
    }

    /** Add a managed stylesheet string (auto enabled/disabled with the plugin). */
    stylesheet(css: string): this {
        this.def.styles.push(css);
        return this;
    }

    /** Declare a single setting (accumulated and turned into a settings object). */
    setting(key: string, opts: SettingOptions): this {
        const def: any = { type: opts.type, description: opts.description };
        if (opts.default !== undefined) def.default = opts.default;
        if (opts.displayName) def.displayName = opts.displayName;
        if (opts.placeholder) def.placeholder = opts.placeholder;
        if (opts.options) def.options = opts.options;
        if (opts.markers) def.markers = opts.markers;
        if (opts.multiline) def.multiline = opts.multiline;
        if (opts.restartNeeded) def.restartNeeded = opts.restartNeeded;
        if (opts.onChange) def.onChange = opts.onChange;
        if (opts.hidden !== undefined) def.hidden = opts.hidden;
        if (opts.disabled !== undefined) def.disabled = opts.disabled;
        this.def.settingsDef[key] = def;
        return this;
    }

    /** Subscribe to a typed framework event. */
    on<K extends keyof RevcordEventMap>(event: K, handler: (payload: RevcordEventMap[K]) => void): this {
        // bridge into a flux-like handler is overkill; store as a lifecycle listener
        const prev = this.def.onStart;
        this.def.onStart = async () => {
            await prev?.();
            EventBus.on(event, handler as any);
        };
        return this;
    }

    /** Code to run when the plugin starts. */
    start(fn: () => void | Promise<void>): this {
        const prev = this.def.onStart;
        this.def.onStart = async () => {
            await prev?.();
            await fn();
        };
        return this;
    }

    /** Code to run when the plugin stops. */
    stop(fn: () => void | Promise<void>): this {
        const prev = this.def.onStop;
        this.def.onStop = async () => {
            await prev?.();
            await fn();
        };
        return this;
    }

    /** Finalise and return a `definePlugin` instance ready to `export default`. */
    build(): PluginDef & { started: boolean; } {
        const { def } = this;
        const { startAt } = def;
        const logger = new Logger(def.name, "#cba6f7");

        const plugin: any = {
            name: def.name,
            description: def.description,
            authors: def.authors,
            commands: def.commands,
            patches: def.patches,
            ...(def.required ? { required: true } : {}),
            ...(def.hidden ? { hidden: true } : {}),
            ...(def.enabledByDefault ? { enabledByDefault: true } : {}),
            ...(startAt ? { startAt } : {}),
            start() {
                if (def.onStart) void def.onStart();
                // register commands into the central registry for the palette
                for (const cmd of (def.commands as any[])) {
                    const reg: RevcordCommand = {
                        name: `p:${def.name}:${cmd.name}`.slice(0, 32),
                        description: cmd.description,
                        owner: def.name,
                        category: "Plugin: " + def.name,
                        ...(cmd.predicate ? { predicate: cmd.predicate } : {}),
                        execute: cmd.execute
                    };
                    try { CommandRegistry.register(reg); } catch (e) { logger.error("cmd", e); }
                }
                EventBus.emit("plugin:start", { name: def.name });
            },
            stop() {
                if (def.onStop) void def.onStop();
                EventBus.emit("plugin:stop", { name: def.name });
            }
        };

        if (Object.keys(def.settingsDef).length) {
            // build a settings object lazily to avoid import cycle at module eval
            plugin.settings = {
                pluginName: def.name,
                def: def.settingsDef,
                get store() { return Settings.plugins[def.name]; },
                get plain() { return PlainSettings.plugins[def.name]; },
                use: (filter?: string[]) => useSettings(
                    (filter ? filter.map(k => `plugins.${def.name}.${k}`) : [`plugins.${def.name}.*`]) as any
                ).plugins[def.name]
            } as any;
        }
        if (def.styles.length) {
            plugin.managedStyle = def.styles.join("\n");
        }

        return definePlugin(plugin as any);
    }
}

/**
 * Start building a plugin.
 * @see {@link PluginBuilder} for the full chainable API.
 */
export function plugin(name: string, description: string): PluginBuilder {
    return new PluginBuilder(name, description);
}
