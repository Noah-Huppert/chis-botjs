const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { exec } = require("child_process");

// Production Ready flag
const stable = false;

// Slash Command
const data = new SlashCommandBuilder()
  .setName("server")
  .setDescription("Start/stop a service on [server.chis.dev]")
  .addStringOption((option) =>
    option
      .setName("service")
      .setDescription("Select a service")
      .setRequired(true)
      .addChoice("7 Days to Die", "7dtd")
      .addChoice("Valheim", "valheim")
  )
  .addStringOption((option) =>
    option
      .setName("state")
      .setDescription("Select a state")
      .setRequired(true)
      .addChoice("Start", "start")
      .addChoice("Stop", "stop")
  );

// Embedded Message Reply (default will change soon)
const exampleEmbed = new MessageEmbed()
  .setColor("#0099ff")
  .setTitle("Some title")
  .setURL("https://discord.js.org/")
  .setAuthor({
    name: "Some name",
    iconURL: "https://i.imgur.com/AfFp7pu.png",
    url: "https://discord.js.org",
  })
  .setDescription("Some description here")
  .setThumbnail("https://i.imgur.com/AfFp7pu.png")
  .addFields(
    { name: "Regular field title", value: "Some value here" },
    { name: "\u200B", value: "\u200B" },
    { name: "Inline field title", value: "Some value here", inline: true },
    { name: "Inline field title", value: "Some value here", inline: true }
  )
  .addField("Inline field title", "Some value here", true)
  .setImage("https://i.imgur.com/AfFp7pu.png")
  .setTimestamp()
  .setFooter({
    text: "Some footer text here",
    iconURL: "https://i.imgur.com/AfFp7pu.png",
  });

// Interaction Event Action
async function run(interaction) {
  const state = interaction.options.getString("state");
  const service = interaction.options.getString("service");

  // Docker Command
  exec(`docker ${state} ${service}`, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    output = stdout;
    console.log(`stdout: ${stdout}`);
  });
  await interaction.reply({
    embeds: [exampleEmbed],
    ephemeral: true,
  });
}

exports.stable = stable;
exports.data = data;
exports.run = run;
