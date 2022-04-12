import { MessageEmbed } from "discord.js";
import { exec } from "child_process";
import {
	Client,
	InteractionReplyOptions,
	MessageActionRow,
	MessageButton,
} from "discord.js";
import moment from "moment-timezone";
import { logger } from "./bot";
import { services } from "./commands/server";
import {
	Database,
	Plan,
	UserTzConfig,
} from "./database";
import {
	timezone as defaultTimezone,
} from "./config";

export function embed(title: string, spots: number, participants: string[], time?: number | string) {
  var mention = "No one has joined the plan.";

	// Show time in title
	let timeStr = "";
	let startingIn = undefined;
	if (typeof time === "number") {
		// Epoch
		timeStr = `<t:${time}:t>`;
		startingIn = `<t:${time}:R>`;
	} else if (typeof time === "string") {
		timeStr = time;
	}

	let titleTime = "";
	if (time !== undefined) {
		titleTime = ` @ ${timeStr}`;
	}

	// Show participants
  if (participants.length) {
    mention = participants
      .map((participant: string, x: number) => `${x + 1}. <@!${participant}>`)
      .join(`\n`);
	}
	
  const embed = new MessageEmbed()
    .setColor("PURPLE")
    .setTitle(`title${titleTime}`)
    .setAuthor({
      name: "Chis Bot",
      iconURL:
        "https://cdn.discordapp.com/app-icons/724657775652634795/22a8bc7ffce4587048cb74b41d2a7363.png?size=512",
      url: "https://chis.dev/chis-botjs/",
    })
    .addField(`Participants (${participants.length}/${spots})`, mention)
    .addField(`Slash Commands`, `/join, /leave, /view, /plan, /rename, /reschedule, /gather, /timezone`)
    .setTimestamp()
    .setFooter({
      text: "server.chis.dev",
      iconURL:
        "https://cdn.discordapp.com/avatars/219152343588012033/4c7053ce4c177cdab007d986c47b9410.webp?size=512",
    });

	if (startingIn !== undefined) {
		embed.addField("Starting In", startingIn);
	}

	return embed;
}

/**
 * @returns An embed setup to look like an error.
 */
export function statusEmbed({ level, title, message }: {
	level: "error" | "warning" | "success",
	title?: string,
	message: string,
}) {
	const color = level === "error" ? "RED" : level === "warning" ? "YELLOW" : "GREEN";
	const titleEmoji = level === "error" ? ":no_entry_sign:" : level === "warning" ? ":warning:": ":white_check_mark:";
	const titleBody = title !== undefined ? title : level === "error" ? "Error" : level === "warning" ? "Warning": "Success";
	return new MessageEmbed()
	  .setColor(color)
    .setTitle(`${titleEmoji} ${titleBody}`)
    .setDescription(message);
}

export async function changeStatus(client: Client): Promise<void> {
  // Wait for Docker Service To Start/Stop
  const delay = (ms: number | undefined) =>
    new Promise((res) => setTimeout(res, ms));
  await delay(11000);

  logger.info("Updating client status.");

  exec(
    `docker ps --format "table {{.Names}}" | grep -w '${services.join("\\|")}'`,
    (error, stdout, stderr) => {
      if (stdout.length) {
        client.user?.setStatus("online");
      } else {
        client.user?.setStatus("idle");
      }
    }
  );
}

/**
 * The custom ID of the show time button.
 */
export const SHOW_PLAN_TIME_BUTTON_CUSTOM_ID = "SHOW_PLAN_TIME";

/**
 * Constructs a Discord message which shows a plan.
 */
export async function planMessage(plan: Plan): Promise<InteractionReplyOptions> {
	let title = plan.title;
	
	const components = [];
	let timeEpoch: string | number | undefined = undefined;
	if (plan.time !== undefined) {
		// Create timezone conversion button
		if (moment.unix(parseInt(plan.time, 10)).isValid()) {
			components.push(new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId(SHOW_PLAN_TIME_BUTTON_CUSTOM_ID)
						.setEmoji("⌚")
						.setLabel("Show Local Time")
						.setStyle("SECONDARY")));
		}

		// Show time in title
		const data = new Database(plan.id);
		const userTz = await data.getUserTz(plan.creatorUserId) || defaultTimezone;

		const parsedTime = moment.unix(parseInt(plan.time, 10));
		if (parsedTime.isValid()) {
			// Time is a valid time
			timeEpoch = parsedTime.valueOf()/100;
		}
	}
	
  return {
    embeds: [embed(plan.title, plan.spots, plan.participants, timeEpoch)],
		components: components,
    ephemeral: false,
  };
}
