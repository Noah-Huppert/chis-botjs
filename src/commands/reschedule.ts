import { SlashCommandBuilder } from "@discordjs/builders";
import {
	CommandInteraction,
	ButtonInteraction,
	MessageEmbed,
} from "discord.js";
import moment from "moment-timezone";
import userTime from "user-time";
import {
	Database,
} from "../database";
import {
	SHOW_PLAN_TIME_BUTTON_CUSTOM_ID,
	planMessage,
	statusEmbed,
} from "../utils";
import { timezone as defaultTimezone } from "../config";

export const stable = true;

// Slash Command
export const data = new SlashCommandBuilder()
  .setName("reschedule")
  .setDescription("Set a new time for a plan")
  .addStringOption((option) =>
    option
      .setName("time")
      .setDescription("New time for the plan")
      .setRequired(true)
	);

// On Interaction Event
export async function run(interaction: CommandInteraction) {
	await interaction.deferReply();
	
  const user = interaction.user;
	const time = interaction.options.getString("time");

	if (time === null) {
		return;
	}

  // Establish Connection To Database
  const data = new Database(interaction.guild!.id);

	// Parse time based on user's timezone
	let utcTime =  time !== null ? await data.parseUserTimeInput(user.id, time) : undefined;

  // Delete Previous Message
  data.read().then(async (plan) => {
    if (plan)
      interaction
        .guild!.channels.fetch(plan.channelId)
        .then(async (channel) => {
          if (channel === null || !channel.isText()) return;

          channel.messages
            .fetch(plan.messageId)
            .then(async (message) => {
              await message.delete();
            })
            .catch((error) => {
              console.error(error);
            });
        })
        .catch((error) => {
          console.error(error);
        });
  });

  // Update Plan
	const plan = await data.read();
	if (plan === null) {
		await interaction.followUp({
      embeds: [
				statusEmbed({
					level: "warning",
					message: "No current plan",
				}),
      ],
      ephemeral: true,
    });
		return;
	}
	plan.time = utcTime || time || undefined;
	await data.update(plan);
	
  // Send Embed
  await interaction.followUp(await planMessage(plan));

  // Save Last Message
  interaction.fetchReply().then(async (message) => {
    if (!("channelId" in message)) return;
    await data.lastMessage(message.channelId, message.id);
  });
}
