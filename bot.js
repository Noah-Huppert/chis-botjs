const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { Client, Intents } = require("discord.js");
const fs = require("node:fs");
const dotenv = require("dotenv");

// Environment Vars
dotenv.config();
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

// Load Commands
const commands = [];
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "9" }).setToken(token);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    // Development Guild Commands
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();

// Initialize Bot
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// Log into Discord
client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  if (!client.application?.owner) await client.application?.fetch();

  // console.log(await client.guilds.cache.get(guildId)?.commands.fetch());

  const command = await client.guilds.cache
    .get(guildId)
    ?.commands.fetch("956652066166685697");

  const permissions = [
    {
      id: "957112569435402250",
      type: "ROLE",
      permission: true,
    },
  ];

  await command.permissions.set({ permissions });
});

// Interaction Event Listener
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (commandFiles.includes(`${interaction.commandName}.js`)) {
    require(`./commands/${interaction.commandName}.js`).run(interaction);
  }
});

client.login(process.env.DISCORD_TOKEN);
