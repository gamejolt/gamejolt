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

	async setPackageInstallDir(localPackage: LocalDbPackage, dir: string) {
		await this.setPackageData(localPackage, { install_dir: dir });
	}

	async setPackageInstallState(localPackage: LocalDbPackage, state: LocalDbPackagePatchState) {
		await this.setPackageData(localPackage, { install_state: state });
	}

	async setPackagePatchPaused(localPackage: LocalDbPackage) {
		await this.setPackageData(localPackage, { patch_paused: true });
	}

	async setPackagePatchResumed(localPackage: LocalDbPackage) {
		await this.setPackageData(localPackage, { patch_paused: false });
	}

	async setPackagePatchQueued(localPackage: LocalDbPackage) {
		await this.setPackageData(localPackage, { patch_queued: true });
	}

	async setPackagePatchUnqueued(localPackage: LocalDbPackage) {
		await this.setPackageData(localPackage, { patch_queued: false });
	}

	async setPackageUpdateData(localPackage: LocalDbPackage, update: LocalDbPackage) {
		await this.setPackageData(localPackage, { update });
	}

	async setPackageUpdateState(localPackage: LocalDbPackage, state: LocalDbPackagePatchState) {
		await this.setPackageData(localPackage, { update_state: state });
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

	async setPackageDownloadProgress(
		localPackage: LocalDbPackage,
		progress: LocalDbPackageProgress | null
	) {
		await this.setPackageData(localPackage, { download_progress: progress });
	}

	async setPackageUnpackProgress(
		localPackage: LocalDbPackage,
		progress: LocalDbPackageProgress | null
	) {
		await this.setPackageData(localPackage, { unpack_progress: progress });
	}

	/**
	 * Clears any state information contained in the package to a clean slate. Can be used after
	 * operations complete or fail.
	 */
	async clearPackageOperations(localPackage: LocalDbPackage) {
		await this.setPackageData(localPackage, {
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

	async setPackageLaunching(localPackage: LocalDbPackage) {
		await this.setPackageData(localPackage, { run_state: LocalDbPackageRunState.LAUNCHING });
	}

	async setPackageRunningPid(localPackage: LocalDbPackage, pid: LocalDbPackagePid) {
		await this.setPackageData(localPackage, {
			run_state: LocalDbPackageRunState.RUNNING,
			running_pid: pid,
		});
	}

	async clearPackageRunningPid(localPackage: LocalDbPackage) {
		await this.setPackageData(localPackage, {
			run_state: null,
			running_pid: null,
		});
	}

	async setPackageRemoveState(localPackage: LocalDbPackage, state: LocalDbPackageRemoveState) {
		await this.setPackageData(localPackage, { remove_state: state });
	}
}
