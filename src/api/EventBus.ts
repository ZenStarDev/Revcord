/*
 * Revcord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Logger } from "@utils/Logger";

const logger = new Logger("EventBus", "#89b4fa");

export interface RevcordEventMap {
    /** A plugin was started */
    "plugin:start": { name: string; };
    /** A plugin was stopped */
    "plugin:stop": { name: string; };
    /** A plugin failed to start/stop and was quarantined */
    "plugin:error": { name: string; stage: "start" | "stop"; error: unknown; };
    /** Safe mode was engaged because too many plugins kept crashing */
    "safemode:engage": { crashes: number; crashLoop: string[]; };
    /** Safe mode was dismissed by the user */
    "safemode:dismiss": Record<string, never>;
    /** Settings were flushed to disk */
    "settings:flush": { path: string | null; };
    /** A command was registered/unregistered */
    "command:register": { name: string; owner: string; };
    "command:unregister": { name: string; owner: string; };
    /** Indicator of the client-mod runtime health */
    "status:change": { ok: boolean; reason?: string; };
    /** Generic lifecycle hook for plugin authors */
    "app:ready": Record<string, never>;
}

type Handler<T> = (payload: T) => void;

interface Subscription {
    id: number;
    handler: Handler<any>;
    once: boolean;
}

/**
 * A tiny, crash-safe, typed publish/subscribe bus.
 *
 * Unlike discord's FluxDispatcher, every handler is isolated: an exception in
 * one listener can never prevent the others (or the emitter) from running. This
 * is the backbone of Revcord's stability guarantees — plugins talk to each other
 * through this bus instead of reaching into each other's internals.
 */
class EventBusImpl {
    private readonly listeners = new Map<keyof RevcordEventMap, Set<Subscription>>();
    private nextId = 1;

    private getSet<K extends keyof RevcordEventMap>(event: K): Set<Subscription> {
        let set = this.listeners.get(event);
        if (!set) {
            set = new Set();
            this.listeners.set(event, set);
        }
        return set;
    }

    /**
     * Subscribe to an event. Returns an unsubscribe function.
     */
    on<K extends keyof RevcordEventMap>(event: K, handler: Handler<RevcordEventMap[K]>): () => void {
        const sub: Subscription = { id: this.nextId++, handler, once: false };
        this.getSet(event).add(sub);
        return () => this.off(event, handler);
    }

    /** Subscribe to an event only once. */
    once<K extends keyof RevcordEventMap>(event: K, handler: Handler<RevcordEventMap[K]>): () => void {
        const sub: Subscription = { id: this.nextId++, handler, once: true };
        this.getSet(event).add(sub);
        return () => this.off(event, handler);
    }

    /** Remove a previously registered handler. */
    off<K extends keyof RevcordEventMap>(event: K, handler: Handler<RevcordEventMap[K]>): void {
        const set = this.listeners.get(event);
        if (!set) return;
        for (const sub of set) {
            if (sub.handler === handler) set.delete(sub);
        }
    }

    /** Emit an event to all subscribers. Isolated per-handler. */
    emit<K extends keyof RevcordEventMap>(event: K, payload: RevcordEventMap[K]): void {
        const set = this.listeners.get(event);
        if (!set || set.size === 0) return;

        for (const sub of [...set]) {
            if (sub.once) set.delete(sub);
            try {
                sub.handler(payload);
            } catch (e) {
                logger.error(`Unhandled error in "${String(event)}" listener:\n`, e);
            }
        }
    }

    /** Remove every subscription (used by safe-mode / full reload). */
    clear(): void {
        this.listeners.clear();
    }
}

export const EventBus = new EventBusImpl();
