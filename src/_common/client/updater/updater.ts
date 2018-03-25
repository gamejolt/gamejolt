import * as path from 'path';
import * as os from 'os';
import { SelfUpdater, SelfUpdaterInstance } from 'client-voodoo';

class Updater {
	static readonly CHECK_INTERVAL = 15 * 60 * 1000; // 15min currently
	private manifestPath: string;
	private instance: SelfUpdaterInstance;

	constructor() {
		let cwd = path.dirname(process.execPath);
		if (os.type() === 'Darwin') {
			cwd = path.resolve(cwd, '../../../../../../');
		}
		this.manifestPath = path.resolve(cwd, '..', '.manifest');

		this.check();
		window.setInterval(() => this.check(), Updater.CHECK_INTERVAL);
	}

	async check() {
		try {
			console.log('Checking for client update with the new updater.');

			if (!this.instance) {
				console.log('attaching selfupdater instance for manifest ' + this.manifestPath);
				this.instance = await SelfUpdater.attach(this.manifestPath);
			}

			console.log('Sending checkForUpdates...');
			await this.instance.checkForUpdates();
		} catch (err) {
			console.error(err);
		}
	}
}

const updater = new Updater();
export default updater;
