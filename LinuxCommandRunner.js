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

				let killedFlag = false,
					killingTimeout
				const outStream = new Stdout()
				const errStream = new Stdout()

				docker
					.run('ubuntu', [ 'yes' ], [ outStream, errStream ], { Tty: false }, function(err, data, container) {
						if (!killedFlag) {
							clearTimeout(killingTimeout)

							const stdout = outStream.getContent()

							initialmessage.edit('Ran `' + command + '` in ' + (Date.now() - start) + 'ms')
							const splits = chunk(stdout, 1990)

							splits.forEach(s => {
								message.channel.send('```' + s + '```')
							})
						}
					})
					.on('container', function(container) {
						outStream.once('limit', function() {
							if (killedFlag) return
							killedFlag = true
							console.warn('Container reached buffer limit. Killing...')
							container.kill(function(err, data) {
								if (err) console.error('Killing failed:' + err)
							})
						})

						killingTimeout = setTimeout(function() {
							if (killedFlag) return
							killedFlag = true
							console.warn('Container reached timeout. Killing...')
							initialmessage.edit('Timeout reached, canceling... :(')

							container.kill(function(err, data) {
								if (err) console.error('Killing failed: ' + err)
							})
						}, 2000)
					})
			} catch (error) {
				message.channel.send('**Error**: ```\n' + error + '```')
			}
		})
	}
}

module.exports = LinuxCommandRunner
