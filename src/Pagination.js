const EventEmitter = require('events');

class PagniatedMessage extends EventEmitter {
    constructor(stdout, cmd_message) {
        super()
        this.stdout = stdout
        this.cmd_message = cmd_message
        this.chunks = this.chunkStdout()
        this.max_page = this.chunks.length - 1
        this.min_page = 0
        this.current_page = 0
        this.sendInitialMessage()
        
        this.message = null
    }

    chunkStdout() {
        const chunks = []
        const max_size = 512
        // I then loop over and chunk it into seperate bits
        for (var i = 0, charsLength = this.stdout.length; i < charsLength; i += max_size) {
        // push to the chunks array.
            chunks.push(this.stdout.substring(i, i + max_size))
        }
        return chunks;
    }

    renderPage() {
        this.message.edit(this.getCurrentPageData())
    }

    getCurrentPageData() {
        const header = `${this.current_page + 1}/${this.max_page + 1}`
        const body = '```' + this.chunks[this.current_page] + '```'
        return header + body
    }

    nextPage() {
        this.current_page++;
        this.current_page = Math.min(this.current_page, this.max_page)
        this.renderPage();
    }

    prevPage() {
        this.current_page--;
        this.current_page = Math.max(this.current_page, this.min_page)
        this.renderPage();
    }

    firstPage() {
        this.current_page = this.min_page;
        this.renderPage();
    }
    lastPage() {
        this.current_page = this.max_page;
        this.renderPage();
    }


    sendInitialMessage() {
        this.cmd_message.channel.send(this.getCurrentPageData()).then(msg => {
            this.message = msg

            this.collector = this.message.createReactionCollector((reaction, user) => {
                return !user.bot && ["⏮", "⬅","➡", "⏭"].includes(reaction.emoji.name)
            })
    
            this.collector.on("collect", r => {
                this.handleReaction(r)
            })

            this.resetReactions()
        })
    }

    async resetReactions() {
        return new Promise(async (resolve, reject) => {
            await this.message.clearReactions()
            await this.message.react("⏮")
            await this.message.react("⬅")
            await this.message.react('➡')
            await this.message.react("⏭")
            resolve()
        })
        
    }

    handleReaction(reaction) {

        const users = Array.from(reaction.users)

        users.forEach(([id, user]) => {
            if (!user.bot) reaction.remove(user)
        })
        if (reaction.emoji.name == "⏮") this.firstPage();
        if (reaction.emoji.name == "⬅") this.prevPage()
        if (reaction.emoji.name == "➡") this.nextPage()
        if (reaction.emoji.name == "⏭") this.lastPage()
    }
}


module.exports = PagniatedMessage