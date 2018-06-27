# Game Jolt

This is the whole frontend for Game Jolt. It powers the site and the client.

We wanted to make it open source so everyone can get visibility into what we are working on. Browse the code to see how Game Jolt is put together. Feel free to offer suggestions on how to do things better, as well as contributing your own code. I'll get a better guide on how to contribute soon.

### Translations

Translations are done by the community. If you want to participate, feel free to join [here](https://poeditor.com/join/project/B4nWT6EgnD).

### Building

- Install NodeJS v6+
- Install Yarn
- Run in terminal (Git Bash on Windows):
	- `git submodule init`
	- `git submodule update`
	- `yarn`
	- `./node_modules/.bin/gulp translations:compile`
	- `yarn run dev`

That should set up a tiny server that hosts the website for you on your computer at http://localhost:8080. Open that URL up in a web browser and you should have Game Jolt running!
