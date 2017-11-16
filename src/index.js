// Load up the discord.js library
const Discord = require('discord.js')
const axios = require('axios')
const LinuxCommandRunner = require('./LinuxCommandRunner')


const client = new Discord.Client()
const config = require('../config.json')

client.on('ready', () => {
	// This event will run if the bot starts, and logs in, successfully.
	console.log(
		`Bot has started with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds
			.size} guilds.`
	)
})

client.on('message', async message => {
	if (message.author.bot) return
	
	const args = message.content.slice(1).trim().split(/ +/g)
	const command = args.shift().toLowerCase()

	if (message.content.indexOf('$') == 0) {
		const handler = new LinuxCommandRunner()
		handler.run(client, message)
		return
	}
})



client.login(config.token)




