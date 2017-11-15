const docker = new require('dockerode')()
const stream = require('stream')
const config = require('../config.json')

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

class LinuxCommandRunner {
	constructor() {}
	async run(client, message) {
		const command = message.content.slice(1).trim()
		const start = Date.now()

		console.log(`Running command: ${command}`)
		message.channel.send('Spinning up...').then(initialmessage => {
			try {
				const output_stream = new Stdout()

				let killedFlag = false,
					killingTimeout
				const outStream = new Stdout()
				const errStream = new Stdout()
				// Run a docker container called "ubuntu-custom"
				docker
					.run('ubuntu-custom', [ 'bash', '-c', command ], outStream, { Tty: true }, function(
						err,
						data,
						container
					) {
						// make sure to stop the timeout function that would run and kill the container.
						clearTimeout(killingTimeout)
						// Check if there is an error or not
						if (err) {
							// change the initial message to display the status
							initialmessage.edit('Something went wrong!')
							// display the errors in a code block.
							// TODO: Display this in a nicer format
							message.channel.send('```' + JSON.stringify(err, null, 2) + '```')
						} else {
							// make sure the process hasn't been killed yet
							// this prevents the stdout being sent on very long running tasks
							if (!killedFlag) {
								// grab the current text from stdout from the sdtOutStream
								const stdout = outStream.getContent()
								// Change the initial message to display the new status
								// and tell the user that the command ran as well as how long it took.
								initialmessage.edit('Ran `' + command + '` in ' + (Date.now() - start) + 'ms')
								// This one is a little tricky.
								// discord only allows messages with a max size of 2000 characters
								// so I need to chunk it up into smaller parts. To be safe, I'm cutting
								// it into 1990 characters so I can include any formatting I might want
								// Here, I define the initial values
								const splits = []
								const max_size = 1990

								// I then loop over and chunk it into seperate bits
								for (var i = 0, charsLength = stdout.length; i < charsLength; i += max_size) {
									// push to the splits array.
									splits.push(stdout.substring(i, i + max_size))
								}
								// send each part of the split
								splits.forEach(s => {
									message.channel.send('```' + s + '```')
								})
							}
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
							initialmessage.edit(`Timeout (${config.timeout}ms) reached, canceling. :(`)

							container.kill(function(err, data) {
								if (err) console.error('Killing failed: ' + err)
							})
						}, config.timeout)
					})
			} catch (error) {
				message.channel.send('**Error**: ```\n' + error + '```')
			}
		})
	}
}

module.exports = LinuxCommandRunner
