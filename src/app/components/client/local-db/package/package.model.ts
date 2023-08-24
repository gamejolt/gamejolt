import type { IParsedWrapper } from 'client-voodoo';
import { Api } from '../../../../../_common/api/api.service';
import { getDeviceArch, getDeviceOS } from '../../../../../_common/device/device.service';
import { GameBuildModel } from '../../../../../_common/game/build/build.model';
import type { GameBuildLaunchOptionModel } from '../../../../../_common/game/build/launch-option/launch-option.model';
import type { GamePackageModel } from '../../../../../_common/game/package/package.model';
import type { GameReleaseModel } from '../../../../../_common/game/release/release.model';
import { LocalDbModel } from '../model.service';

export type LocalDbPackagePid = string | IParsedWrapper;

export interface LocalDbPackageProgress {
	// Float between 0 and 1.
	progress: number;

	// Time left in seconds.
	timeLeft: number;

	// kbps
	rate: number;
}

export enum LocalDbPackagePatchState {
	PATCH_PENDING = 'patch-pending',
	DOWNLOADING = 'downloading',
	DOWNLOAD_FAILED = 'download-failed',
	DOWNLOADED = 'downloaded',
	UNPACKING = 'unpacking',
	UNPACK_FAILED = 'unpack-failed',
	UNPACKED = 'unpacked',
}

export enum LocalDbPackageRemoveState {
	REMOVING = 'removing',
	REMOVE_FAILED = 'remove-failed',
}

export enum LocalDbPackageRunState {
	LAUNCHING = 'launching',
	RUNNING = 'running',
}

class LocalDbPackageRelease {
	id = 0;
	version_number = '';
}

class LocalDbPackageBuild {
	id = 0;
	folder = '';
	type = '';
	archive_type = '';
	os_windows = false;
	os_windows_64 = false;
	os_mac = false;
	os_mac_64 = false;
	os_linux = false;
	os_linux_64 = false;
	os_other = false;
	modified_on = 0;
}

class LocalDbPackageFile {
	id = 0;
	filename = '';
	filesize = '';
}

class LocalDbPackageLaunchOption {
	id = 0;
	os = '';
	executable_path = '';
}

export class LocalDbPackage extends LocalDbModel<LocalDbPackage> {
	install_dir = '';
	install_state: LocalDbPackagePatchState | null = null;
	update_state: LocalDbPackagePatchState | null = null;
	remove_state: LocalDbPackageRemoveState | null = null;
	update: LocalDbPackage | null = null;
	download_progress: LocalDbPackageProgress | null = null;
	unpack_progress: LocalDbPackageProgress | null = null;
	patch_paused: boolean | null = null;
	patch_queued: boolean | null = null;
	run_state: LocalDbPackageRunState | null = null;
	running_pid: LocalDbPackagePid | null = null;

	id = 0;
	game_id = 0;
	title = '';
	description = '';

	release = new LocalDbPackageRelease();
	build = new LocalDbPackageBuild();
	file = new LocalDbPackageFile();
	launch_options: LocalDbPackageLaunchOption[] = [];

	get isSettled() {
		return !this.install_state && !this.update_state && !this.remove_state;
	}

	get isPatching() {
		return this.isInstalling || this.isUpdating;
	}

	get isInstalling() {
		return (
			this.install_state === LocalDbPackagePatchState.PATCH_PENDING ||
			this.install_state === LocalDbPackagePatchState.DOWNLOADING ||
			this.install_state === LocalDbPackagePatchState.UNPACKING
		);
	}

	get isUpdating() {
		return (
			this.update_state === LocalDbPackagePatchState.PATCH_PENDING ||
			this.update_state === LocalDbPackagePatchState.DOWNLOADING ||
			this.update_state === LocalDbPackagePatchState.UNPACKING
		);
	}

	get isDownloading() {
		return (
			this.install_state === LocalDbPackagePatchState.DOWNLOADING ||
			this.update_state === LocalDbPackagePatchState.DOWNLOADING
		);
	}

	get isUnpacking() {
		return (
			this.install_state === LocalDbPackagePatchState.UNPACKING ||
			this.update_state === LocalDbPackagePatchState.UNPACKING
		);
	}

	get isPatchPaused() {
		return !!this.patch_paused;
	}

	get isPatchQueued() {
		return !!this.patch_queued;
	}

	get didInstallFail() {
		return (
			this.install_state === LocalDbPackagePatchState.DOWNLOAD_FAILED ||
			this.install_state === LocalDbPackagePatchState.UNPACK_FAILED
		);
	}

	get didUpdateFail() {
		return (
			this.update_state === LocalDbPackagePatchState.DOWNLOAD_FAILED ||
			this.update_state === LocalDbPackagePatchState.UNPACK_FAILED
		);
	}

	get didRemoveFail() {
		return this.remove_state === LocalDbPackageRemoveState.REMOVE_FAILED;
	}

	get isRunning() {
		return this.run_state || !!this.running_pid;
	}

	get isRemoving() {
		return this.remove_state === LocalDbPackageRemoveState.REMOVING;
	}

	get patchProgress() {
		if (this.download_progress) {
			return this.download_progress.progress;
		} else if (this.unpack_progress) {
			return this.unpack_progress.progress;
		}
		return null;
	}

	get executablePath() {
		const launchOption = this.findLaunchOption();
		return launchOption ? launchOption.executable_path : '';
	}

	hydrate() {
		this.release = Object.assign(new LocalDbPackageRelease(), this.release);
		this.build = Object.assign(new LocalDbPackageBuild(), this.build);
		this.file = Object.assign(new LocalDbPackageFile(), this.file);
		this.launch_options = this.launch_options.map(i =>
			Object.assign(new LocalDbPackageLaunchOption(), i)
		);
	}

	static fromSitePackageInfo(
		pkg: GamePackageModel,
		release: GameReleaseModel,
		build: GameBuildModel,
		launchOptions: GameBuildLaunchOptionModel[]
	): Partial<LocalDbPackage> {
		// All launch options are passed in. Let's just pull the ones for our build.
		launchOptions = launchOptions.filter(i => i.game_build_id === build.id);

		return {
			id: pkg.id,
			game_id: pkg.game_id,
			title: pkg.title,
			description: pkg.description,
			release,
			build,
			launch_options: launchOptions,
		};
	}

	static async getAccessToken(packageId: number): Promise<string> {
		const result = await Api.sendRequest(`/updater/get-access-token/${packageId}`, null, {
			apiPath: '/x',
			processPayload: false,
			detach: true,
		});

		if (!result || !result.data || !result.data.token) {
			throw new Error('Result is empty');
		}

		return result.data.token;
	}

	set(data: Partial<LocalDbPackage>) {
		const updateData = Object.assign({}, this, data);

		this.id = updateData.id;
		this.game_id = updateData.game_id;
		this.title = updateData.title;

		this.release.id = updateData.release.id;
		this.release.version_number = updateData.release.version_number;

		this.build.id = updateData.build.id;
		this.build.folder = updateData.build.folder;
		this.build.type = updateData.build.type;
		this.build.archive_type = updateData.build.archive_type;
		this.build.os_windows = updateData.build.os_windows;
		this.build.os_windows_64 = updateData.build.os_windows_64;
		this.build.os_mac = updateData.build.os_mac;
		this.build.os_mac_64 = updateData.build.os_mac_64;
		this.build.os_linux = updateData.build.os_linux;
		this.build.os_linux_64 = updateData.build.os_linux_64;
		this.build.os_other = updateData.build.os_other;
		this.build.modified_on = updateData.build.modified_on;

		this.file.id = updateData.file.id;
		this.file.filename = updateData.file.filename;
		this.file.filesize = updateData.file.filesize;

		// Always copy completely if changing any launch option data.
		if (updateData.launch_options.length > 0) {
			this.launch_options = updateData.launch_options.map(i => {
				const launchOption = new LocalDbPackageLaunchOption();
				launchOption.id = i.id;
				launchOption.os = i.os;
				launchOption.executable_path = i.executable_path;
				return launchOption;
			});
		}

		this.install_dir = updateData.install_dir;
		this.install_state = updateData.install_state;
		this.update_state = updateData.update_state;
		this.remove_state = updateData.remove_state;
		this.update = updateData.update;
		this.download_progress = updateData.download_progress;
		this.unpack_progress = updateData.unpack_progress;
		this.patch_paused = updateData.patch_paused;
		this.patch_queued = updateData.patch_queued;
		this.run_state = updateData.run_state;
		this.running_pid = updateData.running_pid;
	}

	findLaunchOption() {
		const os = getDeviceOS();
		const arch = getDeviceArch();

		let result = undefined;
		for (const launchOption of this.launch_options) {
			let lOs: (string | null)[] = launchOption.os ? launchOption.os.split('_') : [];
			if (lOs.length === 0) {
				lOs = [null, '32'];
			} else if (lOs.length === 1) {
				lOs.push('32');
			}

			if (lOs[0] === os) {
				if (lOs[1] === arch) {
					return launchOption;
				}
				result = launchOption;
			} else if (lOs[0] === null && !result) {
				result = launchOption;
			}
		}

		return result;
	}

	getDownloadUrl() {
		if (this.install_state) {
			return GameBuildModel.getDownloadUrl(this.build.id, {
				forceDownload: true,
			});
		} else if (this.update_state) {
			if (!this.update) {
				throw new Error('Update build is not set');
			}

			return GameBuildModel.getDownloadUrl(this.update.build.id, {
				forceDownload: true,
			});
		}
		throw new Error('Not ready to get the package download url');
	}
}
