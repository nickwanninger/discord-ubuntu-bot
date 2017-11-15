// Load up the discord.js library
const Discord = require('discord.js')
const axios = require('axios')

const giphykey = 'O2NQDVrMXIx4cELfE2ndGQzfg6LzET1B'

const util = require('util')
const exec = util.promisify(require('child_process').exec)

const LinuxCommandRunner = require('./LinuxCommandRunner')

// This is your client. Some people call it `bot`, some people call it `self`,
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client()

// Here we load the config.json file that contains our token and our prefix values.
const config = require('../config.json')
// config.token contains the bot's token
// config.prefix contains the message prefix.

client.on('ready', () => {
	// This event will run if the bot starts, and logs in, successfully.
	console.log(
		`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds
			.size} guilds.`
	)
})

client.on('message', async message => {
	if (message.author.bot) return

	const args = message.content.slice(config.prefix.length).trim().split(/ +/g)
	const command = args.shift().toLowerCase()

	if (message.content.indexOf('$') == 0) {
		const handler = new LinuxCommandRunner()
		handler.run(client, message)
		return
	}
})
client.login(config.token)
