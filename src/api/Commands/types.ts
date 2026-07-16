/*
 * Revcord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Command } from "@revcord/discord-types";
export { ApplicationCommandInputType, ApplicationCommandOptionType, ApplicationCommandType } from "@revcord/discord-types/enums";

export interface RevcordCommand extends Command {
    isRevcordCommand?: boolean;
}
