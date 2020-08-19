const Discord = require('discord.js');

const Client = new Discord.Client();

const prefix = '!';

const fs = require('fs');

const random = require('random');

const jsonfile = require('jsonfile');

Client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    Client.commands.set(command.name, command);
}

Client.once('ready', () => {
    console.log('im online lol ! ');
})

let stats = {};

if (fs.existsSync('stats.json')) {
    stats = jsonfile.readFileSync('stats.json');
}

Client.on('message', message => {

    if (message.author.bot) return;

    if (message.guild.id in stats === false) {
        stats[message.guild.id] = {};
    }

    const guildStats = stats[message.guild.id];

    if (message.author.id in guildStats === false) {
        guildStats[message.author.id] = {
            xp: 0,
            level: 0,
            last_message: 0
        };
    }

    const userStats = guildStats[message.author.id];

    if (Date.now() - userStats.last_message > 2000) {

        userStats.xp += random.int(15, 25);

        userStats.last_message = Date.now();

        const xpToNextLevel = 5 * Math.pow(userStats.level, 2) + 50 * userStats.level + 100;
        if (userStats.xp >= xpToNextLevel) {
            userStats.level++;
            userStats.xp = userStats.xp = -xpToNextLevel;
            message.reply('You has reached level ' + userStats.level);
        }

        jsonfile.writeFileSync('stats.json', stats);

        console.log(message.author.username + ' now has ' + userStats.xp);
        console.log(xpToNextLevel + ' XP needed for next level');

    }

    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'ping') {

        Client.commands.get('ping').execute(message, args);

    } else if (command == 'hello') {

        message.reply('Hi!');

    } else if (command == 'xp') {

        message.channel.send(message.author.username + ' now has ' + userStats.xp);

    } else if (command == 'level') {
        message.channel.send(message.author.username + ' now has ' + userStats.level);
    }
})

Client.login(process.env.token);