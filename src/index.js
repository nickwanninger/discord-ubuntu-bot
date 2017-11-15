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
const config = require('./config.json')
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

	if (command === 'purgeplz') {
		// This command removes all messages from all users in the channel, up to 100.
		message.delete().catch(O_o => {})
		// get the delete count, as an actual number.
		const deleteCount = parseInt(args[0], 10)

		// Ooooh nice, combined conditions. <3
		if (!deleteCount || deleteCount < 2 || deleteCount > 100)
			return message.reply('Please provide a number between 2 and 100 for the number of messages to delete')

		// So we get our messages, and delete them. Simple enough, right?
		const fetched = await message.channel.fetchMessages({ count: deleteCount })
		message.channel
			.bulkDelete(fetched)
			.catch(error => message.reply(`Couldn't delete messages because of: ${error}`))

		return
	}

	if (message.content.indexOf('$') == 0) {
		const handler = new LinuxCommandRunner()
		handler.run(client, message)
		return
	}
})
client.login(config.token)
