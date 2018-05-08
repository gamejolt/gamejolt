import Vue, { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';
import * as path from 'path';
import * as os from 'os';
import { SelfUpdater, SelfUpdaterInstance } from 'client-voodoo';
import {
	ClientLibraryMutation,
	ClientLibraryStore,
	ClientLibraryState,
} from '../../../app/store/client-library';

const CheckInterval = 45 * 60 * 1000; // 45min currently
const win = nw.Window.get();

@Component({})
export class AppClientUpdater extends Vue {
	@ClientLibraryState clientUpdateStatus: ClientLibraryStore['clientUpdateStatus'];
	@ClientLibraryMutation setClientUpdateStatus: ClientLibraryStore['setClientUpdateStatus'];

	private manifestPath: string;
	private instance?: SelfUpdaterInstance;

	created() {
		let cwd = path.dirname(process.execPath);
		if (os.type() === 'Darwin') {
			cwd = path.resolve(cwd, '../../../../../../');
		}
		this.manifestPath = path.resolve(cwd, '..', '.manifest');

		window.setTimeout(() => this.check()); // delay first check to let the store a chance to load in
		window.setInterval(() => this.check(), CheckInterval);
	}

	async check() {
		try {
			console.log('Checking for client update with the new updater.');

			this.setClientUpdateStatus('checking');

			const instance = await this.getInstance();

			console.log('Sending checkForUpdates...');
			const checked = await instance.checkForUpdates();
			if (!checked) {
				throw new Error('Failed to check for updates');
			}
		} catch (err) {
			console.error(err);
			this.setClientUpdateStatus('error');
		}
	}

	async update() {
		console.log('running update from client updater');
		if (this.clientUpdateStatus === 'ready') {
			const instance = await this.getInstance();
			return await instance.updateApply();
		}
		return false;
	}

	private async getInstance() {
		if (!this.instance) {
			console.log('Attaching selfupdater instance for manifest ' + this.manifestPath);

			this.instance = await SelfUpdater.attach(this.manifestPath);
			this.instance
				.on('noUpdateAvailable', () => {
					this.setClientUpdateStatus('none');
				})
				.on('updateAvailable', () => {
					this.instance!
						.updateBegin()
						.catch((err: Error) => {
							console.error(err);
							this.setClientUpdateStatus('error');
						})
						.then(began => {
							if (!began) {
								throw new Error('Failed to begin update');
							}
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

		return this.instance;
	}

	render(h: CreateElement) {
		return h('div');
	}
}
