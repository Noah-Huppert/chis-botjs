const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { Client, Intents } = require("discord.js");

const fs = require("node:fs");

// Environment Vars
const dotenv = require("dotenv");
dotenv.config();

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

// Bot
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// Commands

const commands = [];
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

console.log(commandFiles);

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "9" }).setToken(token);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    // Development

    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });

    // Global

    // await rest.put(
    //   Routes.applicationCommands(clientId),
    //   { body: commands },
    // );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  // Try parsing commandFiles var for valid command
  // Move interaction reply block into commands folder

  if (interaction.commandName === "echo") {
    await interaction.reply({
      content: interaction.options.getString("input"),
      ephemeral: true,
    });
  }
});

client.login(process.env.DISCORD_TOKEN);
