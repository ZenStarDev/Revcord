/*
 * Revcord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
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

export const enum IpcEvents {
    INIT_FILE_WATCHERS = "RevcordInitFileWatchers",

    OPEN_QUICKCSS = "RevcordOpenQuickCss",
    GET_QUICK_CSS = "RevcordGetQuickCss",
    SET_QUICK_CSS = "RevcordSetQuickCss",
    QUICK_CSS_UPDATE = "RevcordQuickCssUpdate",

    GET_SETTINGS = "RevcordGetSettings",
    SET_SETTINGS = "RevcordSetSettings",

    GET_THEMES_LIST = "RevcordGetThemesList",
    GET_THEME_DATA = "RevcordGetThemeData",
    GET_THEME_SYSTEM_VALUES = "RevcordGetThemeSystemValues",
    THEME_UPDATE = "RevcordThemeUpdate",

    OPEN_EXTERNAL = "RevcordOpenExternal",
    OPEN_THEMES_FOLDER = "RevcordOpenThemesFolder",
    OPEN_SETTINGS_FOLDER = "RevcordOpenSettingsFolder",

    GET_UPDATES = "RevcordGetUpdates",
    GET_REPO = "RevcordGetRepo",
    UPDATE = "RevcordUpdate",
    BUILD = "RevcordBuild",

    OPEN_MONACO_EDITOR = "RevcordOpenMonacoEditor",
    GET_MONACO_THEME = "RevcordGetMonacoTheme",

    GET_PLUGIN_IPC_METHOD_MAP = "RevcordGetPluginIpcMethodMap",

    CSP_IS_DOMAIN_ALLOWED = "RevcordCspIsDomainAllowed",
    CSP_REMOVE_OVERRIDE = "RevcordCspRemoveOverride",
    CSP_REQUEST_ADD_OVERRIDE = "RevcordCspRequestAddOverride",

    GET_RENDERER_CSS = "RevcordGetRendererCss",
    RENDERER_CSS_UPDATE = "RevcordRendererCssUpdate",
    PRELOAD_GET_RENDERER_JS = "RevcordPreloadGetRendererJs",

    SUPPORTS_WINDOWS_MATERIAL = "RevcordSupportsWindowsMaterial",
}
