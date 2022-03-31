import type { LaunchInstance as TypeofLaunchInstance, OldLaunchInstance } from 'client-voodoo';
import type { Ref } from 'vue';
import { arrayRemove } from '../../../utils/array';
import { Api } from '../../../_common/api/api.service';
import { Launcher, LaunchInstance } from '../../../_common/client/client-voodoo-imports';
import { Translate } from '../../../_common/translate/translate.service';
import type { LocalDbPackage } from '../../components/client/local-db/package/package.model';
import { handleClientVoodooError, trackClientVoodooOperation } from './client-voodoo';
import type ClientLibraryPackageDataMutations from './package-data-mutations';

export default class ClientLibraryPackageLaunchOperations {
	constructor(
		private readonly currentlyPlaying: Ref<LocalDbPackage[]>,
		private readonly pkgDataOps: ClientLibraryPackageDataMutations
	) {}

	private setCurrentlyPlaying(localPackage: LocalDbPackage) {
		this.currentlyPlaying.value.push(localPackage);
	}

	private unsetCurrentlyPlaying(localPackage: LocalDbPackage) {
		arrayRemove(this.currentlyPlaying.value, i => localPackage.id === i.id);
	}

	async launcherLaunch(localPackage: LocalDbPackage) {
		try {
			await this.pkgDataOps.setPackageLaunching(localPackage);

			let payload: any = null;
			try {
				payload = await Api.sendRequest(
					'/web/dash/token/get-for-game?game_id=' + localPackage.game_id
				);
			} catch (err) {
				console.log('Could not get game token to launch with - launching anyway.');
				console.warn(err);
			}

			const credentials =
				payload && payload.username && payload.token
					? { username: payload.username, user_token: payload.token }
					: null;

			const launchInstance = await Launcher.launch(localPackage as any, credentials);
			this.launcherAttach(localPackage, launchInstance);
			trackClientVoodooOperation('launch', true);
		} catch (err) {
			console.error(err);
			handleClientVoodooError(err, 'launch', Translate.$gettext('Could not launch game.'));
			this.launcherClear(localPackage);
		}
	}

	async launcherReattach(localPackage: LocalDbPackage) {
		if (!localPackage.running_pid) {
			throw new Error('Package is not running');
		}

		try {
			const launchInstance = await Launcher.attach(localPackage.running_pid);
			this.launcherAttach(localPackage, launchInstance);
			trackClientVoodooOperation('attach', true);
		} catch (err) {
			console.log(`Could not reattach launcher instance: ${localPackage.running_pid}`);
			console.error(err);
			handleClientVoodooError(err, 'attach');
			this.launcherClear(localPackage);
		}
	}

	private async launcherAttach(
		localPackage: LocalDbPackage,
		launchInstance: TypeofLaunchInstance | OldLaunchInstance
	) {
		this.setCurrentlyPlaying(localPackage);

		// Typescript can't detect that all possible types of launchInstance have a .on( 'gameOver' ), so we have to assert type.
		if (launchInstance instanceof LaunchInstance) {
			launchInstance.on('gameOver', () => this.launcherClear(localPackage));
		} else {
			launchInstance.on('gameOver', () => this.launcherClear(localPackage));
		}

		await this.pkgDataOps.setPackageRunningPid(localPackage, launchInstance.pid);
	}

	private async launcherClear(localPackage: LocalDbPackage) {
		this.unsetCurrentlyPlaying(localPackage);
		await this.pkgDataOps.clearPackageRunningPid(localPackage);
	}
}
