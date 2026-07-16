/*
 * Revcord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import * as $Badges from "./Badges";
import * as $ChatButtons from "./ChatButtons";
import * as $CommandRegistry from "./CommandRegistry";
import * as $Commands from "./Commands";
import * as $ContextMenu from "./ContextMenu";
import * as $DataStore from "./DataStore";
import * as $EventBus from "./EventBus";
import * as $HotReload from "./HotReload";
import * as $i18n from "./i18n";
import * as $Lifecycle from "./Lifecycle";
import * as $Loggers from "./Loggers";
import * as $MemberListDecorators from "./MemberListDecorators";
import * as $MessageAccessories from "./MessageAccessories";
import * as $MessageDecorations from "./MessageDecorations";
import * as $MessageEventsAPI from "./MessageEvents";
import * as $MessagePopover from "./MessagePopover";
import * as $MessageUpdater from "./MessageUpdater";
import * as $Notices from "./Notices";
import * as $Notifications from "./Notifications";
import * as $PluginSDK from "./PluginSDK";
export * as PluginManager from "./PluginManager";
import * as $ServerList from "./ServerList";
import * as $Settings from "./Settings";
import * as $Styles from "./Styles";
import * as $Themes from "./Themes";
import * as $UserSettings from "./UserSettings";

/**
 * An API allowing you to listen to Message Clicks or run your own logic
 * before a message is sent
 *
 * If your plugin uses this, you must add MessageEventsAPI to its dependencies
 */
export const MessageEvents = $MessageEventsAPI;
/**
 * An API allowing you to create custom notices
 * (snackbars on the top, like the Update prompt)
 */
export const Notices = $Notices;
/**
 * An API allowing you to register custom commands
 */
export const Commands = $Commands;
/**
 * A wrapper around IndexedDB. This can store arbitrarily
 * large data and supports a lot of datatypes (Blob, Map, ...).
 * For a full list, see the mdn link below
 *
 * This should always be preferred over the Settings API if possible, as
 * localstorage has very strict size restrictions and blocks the event loop
 *
 * Make sure your keys are unique (tip: prefix them with ur plugin name)
 * and please clean up no longer needed entries.
 *
 * This is actually just idb-keyval, so if you're familiar with that, you're golden!
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#supported_types}
 */
export const DataStore = $DataStore;
/**
 * An API allowing you to add custom components as message accessories
 */
export const MessageAccessories = $MessageAccessories;
/**
 * An API allowing you to add custom buttons in the message popover
 */
export const MessagePopover = $MessagePopover;
/**
 * An API allowing you to add badges to user profiles
 */
export const Badges = $Badges;
/**
 * An API allowing you to add custom elements to the server list
 */
export const ServerList = $ServerList;
/**
 * An API allowing you to add components as message accessories
 */
export const MessageDecorations = $MessageDecorations;
/**
 * An API allowing you to add components to member list users, in both DM's and servers
 */
export const MemberListDecorators = $MemberListDecorators;
/**
 * An API allowing you to persist data
 */
export const Settings = $Settings;
/**
 * An API allowing you to dynamically load styles
 * a
 */
export const Styles = $Styles;
/**
 * An API allowing you to display notifications
 */
export const Notifications = $Notifications;

/**
 * An api allowing you to patch and add/remove items to/from context menus
 */
export const ContextMenu = $ContextMenu;

/**
 * An API allowing you to add buttons to the chat input
 */
export const ChatButtons = $ChatButtons;

/**
 * An API allowing you to update and re-render messages
 */
export const MessageUpdater = $MessageUpdater;

/**
 * An API allowing you to get an user setting
 */
export const UserSettings = $UserSettings;

/**
 * Don't use this
 */
export const Themes = $Themes;

/**
 * A crash-safe, typed publish/subscribe bus. Plugins should communicate through
 * this instead of reaching into each other's internals.
 */
export const EventBus = $EventBus;

/**
 * Central registry of all loggers, with optional in-memory capture for the dev overlay.
 */
export const Loggers = $Loggers;

/**
 * Discord-independent command registry, powering the Command Palette.
 */
export const CommandRegistry = $CommandRegistry;

/**
 * Declare code that can re-initialise without a full client restart.
 */
export const HotReload = $HotReload;

/**
 * Lightweight i18n with safe fallback.
 */
export const i18n = $i18n;

/**
 * Register global start/stop hooks without being a full plugin.
 */
export const Lifecycle = $Lifecycle;

/**
 * Supreme Plugin SDK — chainable builders that make writing Revcord plugins
 * dramatically faster than raw definePlugin.
 */
export const PluginSDK = $PluginSDK;
