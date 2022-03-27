const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { exec } = require("child_process");

// Production Ready flag
const stable = false;

// Slash Command
const data = new SlashCommandBuilder()
  .setName("server")
  .setDescription("Start/stop a service on [server.chis.dev]")
  .setDefaultPermission(false)
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

// Embedded Message Reply
function embed(service, state) {
  return new MessageEmbed()
    .setColor("#FFC0CB")
    .setTitle("Game Servers")
    .setURL("https://chis.dev/?category=server")
    .setAuthor({
      name: "Chis Bot",
      iconURL:
        "https://cdn.discordapp.com/app-icons/724657775652634795/22a8bc7ffce4587048cb74b41d2a7363.png?size=512",
      url: "https://chis.dev/chis-bot/",
    })
    .setDescription("Thank you for using my bot :)")
    .addField("Service", service, true)
    .addField("Request", state, true)
    .setTimestamp()
    .setFooter({
      text: "server.chis.dev",
      iconURL:
        "https://cdn.discordapp.com/avatars/219152343588012033/4c7053ce4c177cdab007d986c47b9410.webp?size=512",
    });
}

// On Interaction Event
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
    embeds: [embed(service, state)],
    ephemeral: true,
  });
}

exports.stable = stable;
exports.data = data;
exports.run = run;
