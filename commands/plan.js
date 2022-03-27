const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { Database } = require("../database");
const { embed } = require("../utils");

const stable = false;

// Slash Command
const data = new SlashCommandBuilder()
  .setName("plan")
  .setDescription("Create the plan")
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
  );

// On Interaction Event
async function run(interaction) {
  const user = interaction.user;
  const title =
    interaction.options.getString("title") ||
    ":notebook_with_decorative_cover: Game Plan";
  const spots = interaction.options.getInteger("spots") || 10;

  // Establish Connection To Database
  const data = new Database(interaction.guild.id);

  // Join Plan
  data.create(title, spots).then(async (plan) => {
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
