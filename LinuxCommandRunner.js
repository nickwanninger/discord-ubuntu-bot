const docker = new require('dockerode')()
const stream = require('stream')

class Stdout extends stream.Writable {
	constructor() {
		super()
		this.__content = ''
	}

	getContent() {
		return this.__content
	}
	_write(chunk, enc, next) {
		this.__content += chunk.toString()
		next()
	}
}

function chunk(str, size) {
	var chunks = []

	for (var i = 0, charsLength = str.length; i < charsLength; i += size) {
		chunks.push(str.substring(i, i + size))
	}

	return chunks
}

class LinuxCommandRunner {
	constructor() {}
	async run(client, message) {
		const command = message.content.slice(1).trim()
		const start = Date.now()
		message.channel.send('Spinning up...').then(initialmessage => {
			try {
				const output_stream = new Stdout()
				docker.run('ubuntu', command.split(' '), output_stream).then(container => {
					const stdout = output_stream.getContent()

					initialmessage.edit('Ran `' + command + '` in ' + (Date.now() - start) + 'ms')
					const splits = chunk(stdout, 1990)

					splits.forEach(s => {
						message.channel.send('```' + s + '```')
					})
				})
			} catch (error) {
				message.channel.send('**Error**: ```\n' + error + '```')
			}
		})
	}
}

module.exports = LinuxCommandRunner
