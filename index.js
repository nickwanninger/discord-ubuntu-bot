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
	// This event will run on every single message received, from any channel or DM.

	// It's good practice to ignore other bots. This also makes your bot ignore itself
	// and not get into a spam loop (we call that "botception").
	if (message.author.bot) return

	if (message.content.indexOf('$') == 0) {
		const handler = new LinuxCommandRunner()
		handler.run(client, message)
		return
	}

	// Also good practice to ignore any message that does not start with our prefix,
	// which is set in the configuration file.
	if (message.content.indexOf(config.prefix) !== 0) return

	const args = message.content.slice(config.prefix.length).trim().split(/ +/g)
	const command = args.shift().toLowerCase()
	const args_combined = args.join(' ')

	if (command === 'ping') {
		// Calculates ping between sending a message and editing it, giving a nice round-trip latency.
		// The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
		const m = await message.channel.send('Ping?')
		m.edit(
			`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(
				client.ping
			)}ms`
		)
	}

	if (command === 'gif') {
		axios
			.get('https://api.giphy.com/v1/gifs/random?api_key=O2NQDVrMXIx4cELfE2ndGQzfg6LzET1B')
			.then(response => {
				message.channel.send(response.data.data.image_url)
			})
			.catch(err => {
				console.log(err)
			})
	}

	if (command === 'purge') {
		const deleteCount = parseInt(args[0], 10)

		if (!deleteCount || deleteCount < 2 || deleteCount > 100)
			return message.reply('Please provide a number between 2 and 100 for the number of messages to delete')

		const fetched = await message.channel.fetchMessages({ count: deleteCount })
		message.channel
			.bulkDelete(fetched)
			.catch(error => message.reply(`Couldn't delete messages because of: ${error}`))
	}
})

client.login(config.token)
