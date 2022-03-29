const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { Database } = require("../database");

const stable = true;

// Slash Command
const data = new SlashCommandBuilder()
  .setName("gather")
  .setDescription("Mention all participants");

// On Interaction Event
async function run(interaction) {
  // Establish Connection To Database
  const data = new Database(interaction.guild.id);

  // Get Participants
  data.read().then(async (plan) => {
    if (plan) {
      if (!plan.participants.length) {
        // Send Missing player Embed
        await interaction.reply({
          embeds: [
            new MessageEmbed()
              .setColor("RED")
              .setTitle(":warning: Warning")
              .setDescription("Currently no participants to mention."),
          ],
          ephemeral: true,
        });
        return
      }
      
      mention = plan.participants
      .map((participant, x) => `<@!${participant}>`)
      .join(` `);

      // Send Message
      await interaction.reply({
        content: mention,
        ephemeral: false,
      });

      // Save Last Message
      interaction.fetchReply().then(async (message) => {
        console.log(message);
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

exports.stable = stable;
exports.data = data;
exports.run = run;
