# Discord Linux Bot
## Run basic linux commands in an ephemeral docker container
---

### Getting started
1. The first thing you have to do is build the docker image that the bot is able to spin up containers of. To do that, run `npm run build-docker` and the rest should be handled.
2. Now you have to setup your token, run `cp config.default.json config.json` and fill in the token key in `config.json`
3. Run `npm start` to start the bot.
