const {Client, GatewayIntentBits, Partials, Collection, EmbedBuilder, ButtonBuilder, Events, ActionRowBuilder,ButtonStyle} = require('discord.js');

const {Guilds, GuildMembers, GuildMessages, MessageContent, GuildMessageReactions, GuildModeration} = GatewayIntentBits;
const {User, Message, GuildMember, ThreadMember, Channel, DirectMessages} = Partials;

const {loadEvents} = require('./Handlers/eventHandler');
const {loadCommands} = require('./Handlers/commandHandler');

const client = new Client({
    intents: [Guilds, GuildMembers, GuildMessages, 'GuildVoiceStates', MessageContent, GuildMessageReactions, GuildModeration],
    partials: [User, Message, GuildMember, ThreadMember, Channel, DirectMessages],
    allowedMentions: {
        repliedUser: false,
    },
});

client.on("ready", (client) => {
    console.log("Now Online: " + client.user.tag);
});

client.on('guildCreate', guild => {
    const defaultChannel = guild.systemChannel;
    if (defaultChannel) {
        const embed = new EmbedBuilder()
        .setColor('#e01444')
        .setTitle('Merhaba!')
        .setDescription("Beni sunucuna eklediğin için teşekkürler!\n'/' ön ekini kullanarak ile komutları çağırabilirsin.\n\nHerhangi bir kanala '/yardım' yazarak beni kullanmaya başlayabilirsin :)");
        defaultChannel.send({ embeds: [embed] });
    }
  });

client.commands = new Collection();
client.config = require('./config.json');

module.exports = client;

client.login(client.config.token).then(() => {
    loadEvents(client);
    loadCommands(client);
});