const { MessageEmbed } = require("discord.js");

function embed(title, spots, participants) {
  var mention = "No one has joined the plan.";
  if (participants.length)
    mention = participants
      .map((participant, x) => `${x + 1}. <@!${participant}>`)
      .join(`\n`);
  return new MessageEmbed()
    .setColor("PURPLE")
    .setTitle(title)
    .setAuthor({
      name: "Chis Bot",
      iconURL:
        "https://cdn.discordapp.com/app-icons/724657775652634795/22a8bc7ffce4587048cb74b41d2a7363.png?size=512",
      url: "https://chis.dev/chis-bot/",
    })
    .addField(`Participants (${participants.length}/${spots})`, mention)
    .addField(`Commands`, `/join, /leave, /view, /plan`)
    .setTimestamp()
    .setFooter({
      text: "server.chis.dev",
      iconURL:
        "https://cdn.discordapp.com/avatars/219152343588012033/4c7053ce4c177cdab007d986c47b9410.webp?size=512",
    });
}

exports.embed = embed;
