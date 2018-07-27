/**
 * Can't be in angular-land since we need to make sure it can update even if we push a broken client out.
 */
import { Updater as NwjsUpdater } from 'nwjs-snappy-updater';
import * as path from 'path';
import * as os from 'os';
import { Window } from 'nw.gui';
import { Config } from 'client-voodoo';
import { db } from '../../../app/components/client/local-db/local-db.service';
import { LocalDbPackage } from '../../../app/components/client/local-db/package/package.model';
import { LocalDbGame } from '../../../app/components/client/local-db/game/game.model';
import * as fs from 'fs';
import * as nwGui from 'nw.gui';
import { arrayIndexBy } from '../../../lib/gj-lib-client/utils/array';

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

		// This is to ensure we can write the migration file before updating. We abort otherwise with an exception.
		const migrationFile = path.join(nwGui.App.dataPath, '0.12.3-migration.json');
		fs.writeFileSync(migrationFile, '');

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

		console.log('Saving indexeddb and localStorage...');
		const [packages, games] = await Promise.all([
			// Need these type hints because dexie returns its own Dexie.Promises.
			db.packages.toArray() as Promise<LocalDbPackage[]>,
			db.games.toArray() as Promise<LocalDbGame[]>,
		]);

		const indexeddbData = {
			games: arrayIndexBy(games, 'id'),
			packages: arrayIndexBy(packages, 'id'),
		};

		const migrationData = {
			indexeddb: indexeddbData,
			localStorage: localStorage,
		};

		fs.writeFileSync(migrationFile, JSON.stringify(migrationData), { encoding: 'utf8' });

		console.log('Updated! Reloading...');
		const win = Window.get();
		(win as any).reloadDev();
	}
}

const updater = new Updater();
export default updater;
