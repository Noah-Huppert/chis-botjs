const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { Database } = require("../database");
const { embed } = require("../utils");

const stable = true;

// Slash Command
const data = new SlashCommandBuilder()
  .setName("leave")
  .setDescription("Leave the plan")
  .addUserOption((option) =>
    option
      .setName("member")
      .setDescription("The member to remove")
      .setRequired(false)
  );

// On Interaction Event
async function run(interaction) {
  const user = interaction.options.getUser("member") || interaction.user;

  // Establish Connection To Database
  const data = new Database(interaction.guild.id);

  // Join Plan
  data.leave(user.id).then(async (plan) => {
    if (plan) {
      // Delete Previous Message
      interaction.guild.channels
        .fetch(plan.channelId)
        .then(async (channel) => {
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
      await interaction.reply({
        embeds: [embed(plan.title, plan.spots, plan.participants)],
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
            .setDescription("Unable to leave the current plan."),
        ],
        ephemeral: true,
      });
    }
  });
}

exports.stable = stable;
exports.data = data;
exports.run = run;
