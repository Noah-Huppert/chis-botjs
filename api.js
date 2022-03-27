const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("node:fs");
const dotenv = require("dotenv");

// Environment Vars
dotenv.config();
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

// Rest API
const rest = new REST({ version: "9" }).setToken(token);

// Command Files
const commands = [];
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

// Load Commands
async function loadApplicationCommands() {
  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command.stable) {
      commands.push(command.data.toJSON());
    }
  }

  try {
    console.log("Started refreshing application (/) commands.");

    // Global Application Commands Delete
    rest.get(Routes.applicationCommands(clientId)).then((data) => {
      const promises = [];
      for (const command of data) {
        const deleteUrl = `${Routes.applicationCommands(clientId)}/${
          command.id
        }`;
        promises.push(rest.delete(deleteUrl));
      }
      return Promise.all(promises);
    });

    if (commands.length) {
      await rest.put(Routes.applicationCommands(clientId), {
        body: commands,
      });
    }

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
}

loadApplicationCommands();
