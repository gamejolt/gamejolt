import * as gui from 'nw.gui';
const win = gui.Window.get();

export class Client {
	static startedSilently = false;

	static init() {
		// Whether or not we started "hidden".
		this.startedSilently = false;

		const app = gui.App;
		if (app.argv.length) {
			for (let i = 0; i < app.argv.length; ++i) {
				if (app.argv[i] === '--silent-start') {
					console.info('Started silently.');
					this.startedSilently = true;
					break;
				}
			}
		}

		// If they try to open the app again we should get a second 'open' event.
		// We should force it into view.
		app.on('open', () => {
			console.info('They tried opening the Client again. Force showing the window.');
			this.show();
		});

		if (!this.startedSilently) {
			console.info('Started explicitly. Force showing the window.');
			this.show();
		}
	}

	/**
	 * A soft close. It won't quit the whole app.
	 */
	static close() {
		win.close();
	}

	/**
	 * Can be used to bring the window back up when it's closed.
	 */
	static show() {
		win.show();
		win.focus();
		win.restore();
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
}
