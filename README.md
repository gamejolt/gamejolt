# Game Jolt

This is the whole frontend for Game Jolt. It powers the site and the client.

We wanted to make it open source so everyone can get visibility into what we are working on. Browse the code to see how Game Jolt is put together. Feel free to offer suggestions on how to do things better, as well as contributing your own code. I'll get a better guide on how to contribute soon.

### Translations

Translations are done by the community. If you want to participate, feel free to join at https://poeditor.com/join/project/B4nWT6EgnD.

### Building 

Will work on better build instructions really really soon!

For now... try something like this.

- Install NodeJS. You may need v4.0.0 or higher. We use [nvm](https://github.com/creationix/nvm) to install multiple node versions. There is also a [windows nvm tool](https://github.com/coreybutler/nvm-windows) that is pretty great.
- Install [gulp](http://gulpjs.com/) globally with `npm i -g gulp`.
- Install [bower](http://bower.io/) globally with `npm i -g bower`.
- Run in terminal:
	- `git submodule init`
	- `git submodule update`
	- `npm i`
	- `bower i`
	- `gulp watch`

That should set up a tiny server that hosts the website for your on your computer at http://localhost:8080. Open that URL up in a web browser and you should have Game Jolt running!

When you make code changes it should live-reload the site for you.

**Client build instructions coming soon. It's a bit more involved, with different instructions per OS.**

I know, I know. Everything is _soon_.
