const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
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
  if (command.stable) {
    commands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: "9" }).setToken(token);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    // Global Application Commands

    rest.get(Routes.applicationCommands(clientId, guildId)).then((data) => {
      const promises = [];
      for (const command of data) {
        const deleteUrl = `${Routes.applicationCommands(clientId, guildId)}/${
          command.id
        }`;
        promises.push(rest.delete(deleteUrl));
      }
      return Promise.all(promises);
    });

    if (commands.length) {
      await rest.put(Routes.applicationCommands(clientId), { body: commands });
    }

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
