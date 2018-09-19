import * as os from 'os';
import * as path from 'path';
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
		win.hide();
	}

	/**
	 * Can be used to bring the window back up when it's closed.
	 */
	static show() {
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

	// Gets the directory the joltron binary is running from.
	static get joltronDir() {
		if (os.type() === 'Darwin') {
			// On mac nw.App.startPath is apparantly unreliable, but process.cwd() always changes to app.nw folder.
			// Need to traverse up this path.
			// data-packageId-buildId/Game Jolt Client.app/Contents/Resources/app.nw
			return path.resolve(process.cwd(), '../../../../../');
		}
		return path.resolve(nw.App.startPath, '..');
	}
}
