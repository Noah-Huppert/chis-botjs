const { SlashCommandBuilder } = require("@discordjs/builders");

const stable = false;

const data = new SlashCommandBuilder()
  .setName("echo")
  .setDescription("Replies with your input!")
  .addStringOption((option) =>
    option
      .setName("input")
      .setDescription("The input to echo back")
      .setRequired(true)
  );

async function run(interaction) {
  await interaction.reply({
    content: interaction.options.getString("input"),
    ephemeral: true,
  });
}

exports.stable = stable;
exports.data = data;
exports.run = run;
