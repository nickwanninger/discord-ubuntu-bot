const docker = new require('dockerode')()
const stream = require('stream')

var fs = require('fs')

var socket = process.env.DOCKER_SOCKET || '/var/run/docker.sock'
var stats = fs.statSync(socket)

if (!stats.isSocket()) {
	throw new Error('Are you sure the docker is running?')
}

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

var killedFlag = false,
	killingTimeout
const outStream = new Stdout()
const errStream = new Stdout()

docker
	.run('ubuntu', [ 'yes' ], [ outStream, errStream ], { Tty: false }, function(err, data, container) {
		clearTimeout(killingTimeout)
		console.log('END: (err=' + err + ')')
		console.log('Killed: ' + killedFlag)
		console.log('Buffer: ' + outStream.length + ' < ' + outStream.limit)
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
			container.kill(function(err, data) {
				if (err) console.error('Killing failed: ' + err)
			})
		}, 2000)
	})
