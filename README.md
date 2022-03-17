# Game Jolt

This is the whole frontend for Game Jolt. It powers the site and the client.

We wanted to make it open source so everyone can get visibility into what we are working on. Browse the code to see how Game Jolt is put together. Feel free to offer suggestions on how to do things better, as well as contributing your own code. I'll get a better guide on how to contribute soon.

### Translations

Translations are done by the community. If you want to participate, feel free to join at https://poeditor.com/join/project/B4nWT6EgnD.

![](src/_common/loading/loading.gif)

### Building

- Install NodeJS v6+
- Install Yarn
- Run in terminal:
	- `git submodule init`
	- `git submodule update`
	- `yarn`
	- `yarn run dev`

That should set up a tiny server that hosts the website for you on your computer at http://localhost:8080. Open that URL up in a web browser and you should have Game Jolt running!

### Directories in source

/src

↓

//widget-package ← widget embeddable in other webpages 

//utils ← miscellaneous scripts making page more accessible (for example for mobiles) 

//site-editor ← custom blog/portfolio/game pages engine 

//lib ← docs, ToS and all the papers 

//gameserver ← engine for adding and using html games from imported files

//editor ← editors for posts, game descriptions and all the rest

//client ← scripts for making installed clients up and running

//claim ← moderation pages

//checkout ← some temporary bug fixes

//auth ← login and account management (backend)

//app ← source powering all frontent for gamejolt

//\_styles ← layout and colors for gamejolt

//\_common ← graphics and other common files

![](src/_common/loading/loading-stationary.gif)

### License 

look at [here](./LICENSE)

<!--- dont ask CROS who PR'ed, yes im evil --->
