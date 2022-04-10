import dotenv from "dotenv";

// Environment Vars
dotenv.config();
export const token = process.env.DISCORD_TOKEN!;
export const clientId = process.env.CLIENT_ID!;
export const guildId = process.env.GUILD_ID!;
export const accessRole = process.env.ROLE_ID!;
export const timezone = process.env.TIMEZONE!;
export const develop = process.env.DEVELOP!;
