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
	PLAN_TIME_FORMAT,
} from "../database";
import {
	SHOW_PLAN_TIME_BUTTON_CUSTOM_ID,
	planMessage,
} from "../utils";
import { timezone as defaultTimezone } from "../config";

export const stable = true;

// Slash Command
export const data = new SlashCommandBuilder()
  .setName("plan")
  .setDescription("Create a plan (This will overwrite any existing plans)")
  .addStringOption((option) =>
    option
      .setName("title")
      .setDescription("The title of the plan")
      .setRequired(false)
  )
  .addIntegerOption((option) =>
    option
      .setName("spots")
      .setDescription("The number of spots in the plan")
      .setRequired(false)
  )
	.addStringOption((option) =>
		option
			.setName("time")
			.setDescription("The time the plan will begin")
			.setRequired(false)
									);

// Button handlers
export const buttons = {
	[SHOW_PLAN_TIME_BUTTON_CUSTOM_ID]: async (interaction: ButtonInteraction) => {
		await interaction.deferReply();
		
		const data = new Database(interaction.guild!.id);
		
		const plan = await data.read();
		if (plan === null || plan.time === null) {
			return;
		}

		let userTz = await data.getUserTz(interaction.user.id);
		if (userTz === null) {
			userTz = defaultTimezone;
		}

		const timeStr = moment.utc(plan.time, PLAN_TIME_FORMAT).tz(userTz).format("h:mm A z");
		await interaction.followUp({
			embeds: [
				new MessageEmbed()
					.setColor("BLUE")
					.setTitle("⌚ Plan Time")
					.setDescription(`Plan starts at ${timeStr}`),
			],
			ephemeral: true,
		});
	},
};

// On Interaction Event
export async function run(interaction: CommandInteraction) {
  const user = interaction.user;
  const title =
    interaction.options.getString("title") ||
    ":notebook_with_decorative_cover: Game Plan";
  const spots = interaction.options.getInteger("spots") || 10;
	const time = interaction.options.getString("time");

  // Establish Connection To Database
  const data = new Database(interaction.guild!.id);

	// Parse time based on user's timezone
	let utcTime = undefined;
	if (time !== null) {
		// Verify time can be parsed
		// Find user's timezone or use default
		let userTz = await data.getUserTz(user.id);
		if (userTz === null) {
			userTz = defaultTimezone;
		}

		// Oftset based on timezone
		let cleanInputTime = "";
		try {
			cleanInputTime = userTime(time).ISOString;
		} catch (e) {
			// Failed to parse input, not a real date
		}

		if (cleanInputTime.length > 0) {
			const noTzTimeStr = moment(cleanInputTime).format(PLAN_TIME_FORMAT);
			const userTzTime = moment.tz(noTzTimeStr, PLAN_TIME_FORMAT, userTz);
			utcTime = userTzTime.clone().utc();
		}
	}

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

  // Join Plan
  data.create(user.id, title, spots, utcTime || time || undefined).then(async (plan) => {
    // Send Embed
    await interaction.reply(planMessage(plan));

    // Save Last Message
    interaction.fetchReply().then(async (message) => {
      if (!("channelId" in message)) return;
      await data.lastMessage(message.channelId, message.id);
    });
  });
}
