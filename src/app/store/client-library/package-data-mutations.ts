import type {
	LocalDbPackage,
	LocalDbPackagePid,
	LocalDbPackageProgress,
	LocalDbPackageRemoveState,
} from '../../components/client/local-db/package/package.model';
import {
	LocalDbPackagePatchState,
	LocalDbPackageRunState,
} from '../../components/client/local-db/package/package.model';

export default class ClientLibraryPackageDataMutations {
	constructor(
		readonly setPackageData: (
			pkg: LocalDbPackage,
			data: Partial<LocalDbPackage>
		) => Promise<void>,
		readonly unsetPackage: (pkg: LocalDbPackage) => Promise<void>
	) {}

	setPackageInstallDir(localPackage: LocalDbPackage, dir: string) {
		return this.setPackageData(localPackage, { install_dir: dir });
	}

	setPackageInstallState(localPackage: LocalDbPackage, state: LocalDbPackagePatchState) {
		return this.setPackageData(localPackage, { install_state: state });
	}

	setPackagePatchPaused(localPackage: LocalDbPackage) {
		return this.setPackageData(localPackage, { patch_paused: true });
	}

	setPackagePatchResumed(localPackage: LocalDbPackage) {
		return this.setPackageData(localPackage, { patch_paused: false });
	}

	setPackagePatchQueued(localPackage: LocalDbPackage) {
		return this.setPackageData(localPackage, { patch_queued: true });
	}

	setPackagePatchUnqueued(localPackage: LocalDbPackage) {
		return this.setPackageData(localPackage, { patch_queued: false });
	}

	setPackageUpdateData(localPackage: LocalDbPackage, update: LocalDbPackage) {
		return this.setPackageData(localPackage, { update });
	}

	setPackageUpdateState(localPackage: LocalDbPackage, state: LocalDbPackagePatchState) {
		return this.setPackageData(localPackage, { update_state: state });
	}

	async setPackageUpdateComplete(localPackage: LocalDbPackage) {
		// The new data that we need to put on the package is in the "update" property of the local
		// package.
		if (!localPackage.update) {
			throw new Error('Update package does not exist');
		}

		const update = localPackage.update;
		if (!update.install_dir) {
			update.install_dir = localPackage.install_dir;
		}

		await this.clearPackageOperations(localPackage);

		await this.setPackageData(localPackage, {
			// It's a localdb package, so it should have all the correct fields.
			...update,
		});
	}

	setPackageDownloadProgress(
		localPackage: LocalDbPackage,
		progress: LocalDbPackageProgress | null
	) {
		return this.setPackageData(localPackage, { download_progress: progress });
	}

	setPackageUnpackProgress(
		localPackage: LocalDbPackage,
		progress: LocalDbPackageProgress | null
	) {
		return this.setPackageData(localPackage, { unpack_progress: progress });
	}

	/**
	 * Clears any state information contained in the package to a clean slate. Can be used after
	 * operations complete or fail.
	 */
	clearPackageOperations(localPackage: LocalDbPackage) {
		return this.setPackageData(localPackage, {
			update: null,
			install_state: null,
			update_state: null,
			remove_state: null,
			run_state: null,
			download_progress: null,
			unpack_progress: null,
			patch_paused: null,
			patch_queued: null,
			running_pid: null,
		});
	}

	setPackageLaunching(localPackage: LocalDbPackage) {
		return this.setPackageData(localPackage, { run_state: LocalDbPackageRunState.LAUNCHING });
	}

	setPackageRunningPid(localPackage: LocalDbPackage, pid: LocalDbPackagePid) {
		return this.setPackageData(localPackage, {
			run_state: LocalDbPackageRunState.RUNNING,
			running_pid: pid,
		});
	}

	clearPackageRunningPid(localPackage: LocalDbPackage) {
		return this.setPackageData(localPackage, {
			run_state: null,
			running_pid: null,
		});
	}

	setPackageRemoveState(localPackage: LocalDbPackage, state: LocalDbPackageRemoveState) {
		return this.setPackageData(localPackage, { remove_state: state });
	}
}
