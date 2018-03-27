import * as path from 'path';
import * as os from 'os';
import { SelfUpdater, SelfUpdaterInstance } from 'client-voodoo';
import { store } from '../../../app/store/index';
import { ClientUpdateStatus } from '../../../app/store/client-library';

import * as gui from 'nw.gui';
const win = gui.Window.get();

class Updater {
	static readonly CHECK_INTERVAL = 5 * 60 * 1000; // 15min currently
	private manifestPath: string;
	private instance: SelfUpdaterInstance;

	constructor() {
		let cwd = path.dirname(process.execPath);
		if (os.type() === 'Darwin') {
			cwd = path.resolve(cwd, '../../../../../../');
		}
		this.manifestPath = path.resolve(cwd, '..', '.manifest');

		window.setTimeout(() => this.check()); // delay first check to let the store a chance to load in
		window.setInterval(() => this.check(), Updater.CHECK_INTERVAL);
	}

	async check() {
		try {
			console.log('Checking for client update with the new updater.');

			this.setClientUpdateStatus('checking');

			if (!this.instance) {
				console.log('attaching selfupdater instance for manifest ' + this.manifestPath);
				await this.makeInstance();
			}

			console.log('Sending checkForUpdates...');
			await this.instance.checkForUpdates();
		} catch (err) {
			console.error(err);
			this.setClientUpdateStatus('error');
		}
	}

	async update() {
		console.log('running update from client updater');
		// if (store.state.clientLibrary.clientUpdateStatus === 'ready') {
		return await this.instance.updateApply();
		// }
		// return false;
	}

	private async makeInstance() {
		this.instance = await SelfUpdater.attach(this.manifestPath);
		this.instance
			.on('noUpdateAvailable', () => {
				this.setClientUpdateStatus('none');
			})
			.on('updateAvailable', () => {
				this.instance.updateBegin().catch((err: Error) => {
					console.error(err);
				});
			})
			.on('updateBegin', () => {
				this.setClientUpdateStatus('fetching');
			})
			.on('updateReady', () => {
				this.setClientUpdateStatus('ready');
			})
			.on('updateApply', () => {
				win.close(true);
			})
			.on('updateFailed', (reason: string) => {
				console.error('Failed to update. Joltron says: ' + reason);
				this.setClientUpdateStatus('error');
			});
	}

	private setClientUpdateStatus(status: ClientUpdateStatus) {
		store.commit('clientLibrary/setClientUpdateStatus', status);
	}
}

const updater = new Updater();
export default updater;
