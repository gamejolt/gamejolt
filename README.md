# Game Jolt

This is the whole frontend for Game Jolt. It powers the site and the desktop app.

We wanted to make it open source so everyone can get visibility into what we are working on. Browse the code to see how Game Jolt is put together. Feel free to offer suggestions on how to do things better, as well as contributing your own code. I'll get a better guide on how to contribute soon.

### Requirements
- Install NodeJS v16+
- Install Yarn
- Run in terminal:
	- `git submodule init`
	- `git submodule update`
	- `yarn`
- Setup local development certificates.
  - __Windows:__
    1. Run `scripts\generate-certs.ps1`.
    2. Open `gamejoltCA.crt` file it generated.
    3. Press "Install certificate" button.
    4. For "Store Location" leave it as "Current User" and hit "Next".
    5. Choose "Place all certificates in the following store" and hit "Browse"
    6. Choose "Trusted Root Certification Authorities" and hit "Ok"
    7. Restart your browser for changes to take effect.
  - __Linux/Mac:__ TODO

### Running
- __Website__

  Run `yarn dev` in the project directory.

  It'll set up a tiny server that hosts the website for you on your computer at https://development.gamejolt.com. Open that URL up in a web browser and you should have Game Jolt running!


- __Desktop app__

  Run `yarn client:dev` in the project directory.

  In another terminal run `yarn client`.

>Note: First time running these will take longer than usual.

### Translations

Translations are done by the community. If you want to participate, feel free to join at https://poeditor.com/join/project/B4nWT6EgnD.
