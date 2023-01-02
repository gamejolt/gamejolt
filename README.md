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
- Install git pre commit hooks:
  - __Windows__ (from administrator powershell)__:__ `.\git-hooks\install.ps1`
  - __Mac / Linux:__ `./git-hooks/install.sh`
- Add `127.0.0.1 development.gamejolt.com` to your `/etc/hosts` (or `C:\\Windows\\System32\\drivers\\etc\\hosts` on Windows)
- Setup local development certificates.
  - __Windows:__
    1. Run `scripts\certs\generate-cert.ps1`.
    2. Open `gamejoltCA.crt` file it generated.
    3. Press "Install certificate" button.
    4. For "Store Location" leave it as "Current User" and hit "Next".
    5. Choose "Place all certificates in the following store" and hit "Browse"
    6. Choose "Trusted Root Certification Authorities" and hit "Ok"
    7. Restart your browser for changes to take effect.
  - __Linux:__
    1. Run `./scripts/certs/generate-cert.sh`
    2. Add the cert to the local trust
        - _On Ubuntu/Debian_:
          ```
          sudo cp gamejoltCA.crt /usr/local/share/ca-certificates/gamejoltCA.crt
          sudo update-ca-certificates
          ```
        - _On RHEL/Centos/Fedora_:
          ```
          sudo cp gamejoltCA.crt /etc/pki/ca-trust/source/anchors/gamejoltCA.crt
          sudo update-ca-trust extract
          ```
  - __Mac:__ TODO

### Running
- __Website__

  Run `yarn dev` in the project directory.

  It'll set up a tiny server that hosts the website for you on your computer at https://development.gamejolt.com. Open that URL up in a web browser and you should have Game Jolt running!

  * Mac users will also have to forward traffic from port 8443 to 443 to get around a security restriction (see note below)

- __Desktop app__

  Run `yarn client:dev` in the project directory.

  In another terminal run `yarn client`.

  * Mac users will also have to forward traffic from port 8443 to 443 to get around a security restriction (see note below)

>Note: First time running these will take longer than usual.

For more commands see [COMMANDS.md](COMMANDS.md).

### Translations

Translations are done by the community. If you want to participate, feel free to join at https://poeditor.com/join/project/B4nWT6EgnD.

### Notes for Mac Users
Listening on port 443 (the default port for https) requires root privileges, but we want to keep root usage to a minimum.

For this reason, the webserver listens on port 8443 instead, and then in a separate rooted process we can forward traffic from port 443 to port 8443.

There are plenty of ways to do that, personally I like using [socat](https://www.redhat.com/sysadmin/getting-started-socat):
- Install using `brew install socat`
- Run the following while developing:
  ```
  sudo socat tcp4-listen:443,bind=127.0.0.1,reuseaddr,fork tcp:127.0.0.1:8443
  ```
