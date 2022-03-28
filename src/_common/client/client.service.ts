const os = require('os') as typeof import('os');
const path = require('path') as typeof import('path');
const win = nw.Window.get();

export class Client {
	static startedSilently = false;

	static init() {
		// Whether or not we started "hidden".
		this.startedSilently = false;

		if (nw.App.argv.length) {
			for (let i = 0; i < nw.App.argv.length; ++i) {
				if (nw.App.argv[i] === '--silent-start') {
					console.info('Started silently.');
					this.startedSilently = true;
					break;
				}
			}
		}

		// If they try to open the app again we should get a second 'open' event.
		// We should force it into view.
		nw.App.on('open', () => {
			console.info('They tried opening the Client again. Force showing the window.');
			this.show();
		});

		if (!this.startedSilently) {
			console.info('Started explicitly. Force showing the window.');
			this.show();
		}
	}

	/**
	 * Just hides the window. Mostly useful on Mac to hide on soft quit.
	 */
	static hide() {
		if (GJ_IS_WATCHING) {
			sessionStorage.setItem('__vite-window-visible', '0');
		}

		win.hide();
	}

	/**
	 * Can be used to bring the window back up when it's closed.
	 meme
	 */
	static show() {
		// Vite does a full reload a LOT.
		// This is very disruptive in development because the window keeps
		// popping back up and stealing focus. To make things worse, there doesn't seem
		// to be a way to check if a window instance is already visible,
		// so in order to avoid calling show() on it, we just check session storage.
		if (GJ_IS_WATCHING) {
			if (sessionStorage.getItem('__vite-window-visible')) {
				console.log('Not showing the window because it should be visible atm');
				return;
			}
			sessionStorage.setItem('__vite-window-visible', '1');
		}

		win.show();
		win.restore();
		win.focus();
	}

	/**
	 * Quits the whole app.
	 */
	static quit() {
		// Passing in true does a force quit of the application.
		win.close(true);
	}

	static setProgressBar(progress: number) {
		win.setProgressBar(progress);
	}

	static clearProgressBar() {
		win.setProgressBar(-1);
	}

	// Get the directory nwjs is running from.
	static get nwRootDir() {
		// nwPackageDir even makes sense while watching,
		// there are no output files being written out.
		if (GJ_IS_WATCHING) {
			return null;
		}

		// Path on darwin is different. same case as in joltronDir.
		// I'll do this when i set up the mac vm again.
		if (os.type() === 'Darwin') {
			throw new Error('vue3 todo forget me not');
		}

		// NW documentation straight up lies. startPath is the directory from which you launched the app,
		// not the directory where the app is in/starts from.
		// e.g. starting it up as ./build/GameJoltClient.exe will return . (the parent folder of build) instead of ./build.
		// return (nw.App as any).startPath as string;

		// In the same place where the docs lied about startPath, they also mention:
		// "The application will change the current directory to where the package files reside after start."
		// Its unclear whether they mean the package.nw files or the directory that contains the main nw executable.
		// It looks like cwd does indeed change tho, so whatever the hell nwjs is doing it should at least
		// be stable.

		return path.resolve(process.cwd());
	}

	static get nwStaticAssetsDir() {
		if (GJ_IS_WATCHING) {
			return path.resolve(process.cwd(), 'src', 'static-assets');
		}

		const dir = this.nwRootDir;
		if (dir === null) {
			throw new Error('nwPackageDir is null');
		}
		return path.join(dir, 'package');
	}

	// Gets the directory the joltron binary is running from.
	// TODO(vue3) probably broken nw.App.startPath is a lie.
	static get joltronDir() {
		if (os.type() === 'Darwin') {
			// On mac nw.App.startPath is apparantly unreliable, but process.cwd() always changes to app.nw folder.
			// Need to traverse up this path.
			// data-packageId-buildId/Game Jolt Client.app/Contents/Resources/app.nw
			return path.resolve(process.cwd(), '../../../../../');
		}
		return path.resolve(process.cwd(), '..');
	}
}
