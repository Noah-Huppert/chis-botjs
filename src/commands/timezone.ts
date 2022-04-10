import { SlashCommandBuilder } from "@discordjs/builders";
import {
    MessageEmbed,
    CommandInteraction,
    AutocompleteInteraction,
} from "discord.js";
import moment from "moment";
import { Searcher } from "fast-fuzzy";

import { Database } from "../database";
import { embed } from "../utils";

const TZ_SEARCHER = new Searcher(moment.tz.names());
const MAX_DISCORD_CHOICES = 25;

export const stable = true;

// Slash command
export const data = new SlashCommandBuilder()
    .setName("timezone")
    .setDescription("Configure your personal timezone")
    .addStringOption((option) =>
	   option
		  .setName("timezone")
		  .setDescription("Name of the timezone in which you wish to see plan times")
		  .setRequired(true)
		  .setAutocomplete(true));

// Slash command options autocomplete
export const autocomplete = {
    timezone: async (interaction: AutocompleteInteraction, input: string): Promise<void> => {
	   const matches = TZ_SEARCHER.search(input);
	   matches.length = Math.min(matches.length, MAX_DISCORD_CHOICES);
	   
	   await interaction.respond(matches.map((match) => {
			 return {
				name: match,
				value: match,
			 };
		  }));
    },
};

// On Interaction Event
export async function run(interaction: CommandInteraction) {
    const timezoneArg = interaction.options.getString("timezone");
    const tz = moment.tz(timezoneArg);
    console.log(tz);
}
