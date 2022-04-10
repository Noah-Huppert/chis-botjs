import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { Database } from "../database";
import { planMessage } from "../utils";

export const stable = true;

// Slash Command
export const data = new SlashCommandBuilder()
  .setName("view")
  .setDescription("View the plan");

// On Interaction Event
async function run(interaction: CommandInteraction) {
  // Establish Connection To Database
  const data = new Database(interaction.guild!.id);

  // Join Plan
  data.read().then(async (plan) => {
    if (plan) {
      // Delete Previous Message
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

      // Send Embed
      await interaction.reply(planMessage(plan));

      // Save Last Message
      interaction.fetchReply().then(async (message) => {
        if (!("channelId" in message)) return;
        await data.lastMessage(message.channelId, message.id);
      });
    } else {
      // Send Error Embed
      await interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setTitle(":warning: Warning")
            .setDescription("Plan not created."),
        ],
        ephemeral: true,
      });
    }
  });
}
