/**
 * Can't be in angular-land since we need to make sure it can update even if we push a broken client out.
 */
import { Updater as NwjsUpdater } from 'nwjs-snappy-updater';
import * as path from 'path';
import * as os from 'os';
import { Window } from 'nw.gui';
import { Config } from 'client-voodoo';

class Updater {
	static readonly CHECK_INTERVAL = 15 * 60 * 1000; // 15min currently

	constructor() {
		this.check();
		window.setInterval(() => this.check(), Updater.CHECK_INTERVAL);
	}

	async check() {
		console.log('Checking for client update.');

		// Mac exec path looks like:
		// root/blah.app/Contents/Frameworks/nwjs Helper.app/Contents/MacOS/nwjs
		// The other OSes are just the root dir.
		let cwd = path.dirname(process.execPath);
		if (os.type() === 'Darwin') {
			cwd = path.resolve(cwd, '../../../../Resources/app.nw');
		}
		// TODO: figure out a way to tell the package not to update.
		// if (packageJson['no-auto-update'] === true) {
		// 	console.log('Skip update. Package says not to auto-update.');
		// 	return;
		// }

		const nwjsUpdater = new NwjsUpdater(GJ_VERSION, GJ_MANIFEST_URL);
		await nwjsUpdater.cleanup();
		const hasNew = await nwjsUpdater.check();
		if (!hasNew) {
			console.log('Client is up to date.');
			return;
		}

		console.log('New version of client. Updating...');

		// If we're on windows, we need to make sure to release the mutex we have on it.
		// This is so we can clean up the node_modules folder without the mutex binding being in use by the fs.
		if (process.platform === 'win32') {
			try {
				await Config.releaseClientMutex();
			} catch (err) {}
		}

		const wasUpdated = await nwjsUpdater.update();
		if (!wasUpdated) {
			console.log('Update aborted.');
			return;
		}

		console.log('Updated! Reloading...');
		const win = Window.get();
		(win as any).reloadDev();
	}
}

const updater = new Updater();
export default updater;
