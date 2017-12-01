import { Queue } from 'client-voodoo';

import { Settings } from '../../../../_common/settings/settings.service';
import {
	ReturnTypeInstallerCancel,
	ReturnTypeInstallerInstall,
	ReturnTypeInstallerPause,
	ReturnTypeInstallerResume,
	ReturnTypeInstallerRetry,
	ReturnTypeInstallerRollback,
	ReturnTypeInstallerUninstall,
	ReturnTypeRetryAllInstallations,
} from '../../../store/client-library';
import { store } from '../../../store/index';
import { LocalDbGame } from '../local-db/game/game.model';
import { LocalDbPackage } from '../local-db/package/package.model';

export abstract class ClientInstaller {
	static init() {
		this.resetInstallerQueue();

		return this.retryAllInstallations();
	}

	static resetInstallerQueue() {
		Queue.faster = {
			downloads: Settings.get('max-download-count'),
			extractions: Settings.get('max-extract-count'),
		};

		if (Settings.get('queue-when-playing')) {
			Queue.slower = {
				downloads: 0,
				extractions: 0,
			};
		} else {
			Queue.slower = Queue.faster;
		}
	}

	static retryAllInstallations(): ReturnTypeRetryAllInstallations {
		return store.dispatch('clientLibrary/retryAllInstallations') as any;
	}

	static retryInstallation(localPackage: LocalDbPackage): ReturnTypeInstallerRetry {
		return store.dispatch('clientLibrary/installerRetry', localPackage) as any;
	}

	static install(game: LocalDbGame, localPackage: LocalDbPackage): ReturnTypeInstallerInstall {
		return store.dispatch('clientLibrary/installerInstall', [game, localPackage]) as any;
	}

	static pause(localPackage: LocalDbPackage): ReturnTypeInstallerPause {
		return store.dispatch('clientLibrary/installerPause', localPackage) as any;
	}

	static resume(localPackage: LocalDbPackage): ReturnTypeInstallerResume {
		return store.dispatch('clientLibrary/installerResume', localPackage) as any;
	}

	static cancel(localPackage: LocalDbPackage): ReturnTypeInstallerCancel {
		return store.dispatch('clientLibrary/installerCancel', localPackage) as any;
	}

	static rollback(localPackage: LocalDbPackage): ReturnTypeInstallerRollback {
		return store.dispatch('clientLibrary/installerRollback', localPackage) as any;
	}

	static uninstall(localPackage: LocalDbPackage): ReturnTypeInstallerUninstall {
		return store.dispatch('clientLibrary/installerUninstall', localPackage) as any;
	}
}
