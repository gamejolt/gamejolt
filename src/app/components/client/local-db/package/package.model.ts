import { GameBuild } from '../../../../../lib/gj-lib-client/components/game/build/build.model';
import { IParsedWrapper } from 'client-voodoo';
import { store } from '../../../../store/index';
import { GamePackage } from '../../../../../lib/gj-lib-client/components/game/package/package.model';
import { GameRelease } from '../../../../../lib/gj-lib-client/components/game/release/release.model';
import { GameBuildLaunchOption } from '../../../../../lib/gj-lib-client/components/game/build/launch-option/launch-option.model';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import {
	ReturnTypePackageStartUpdate,
	ReturnTypePackageUninstall,
	ReturnTypeSetPackageFieldsAndSave,
} from '../../../../store/client-library';

export type Pid = string | IParsedWrapper;

export interface Progress {
	// Float between 0 and 1.
	progress: number;

	// Time left in seconds.
	timeLeft: number;

	// kbps
	rate: number;
}

export enum PatchState {
	PATCH_PENDING = 'patch-pending',
	DOWNLOADING = 'downloading',
	DOWNLOAD_FAILED = 'download-failed',
	DOWNLOADED = 'downloaded',
	UNPACKING = 'unpacking',
	UNPACK_FAILED = 'unpack-failed',
	UNPACKED = 'unpacked',
}

export enum RemoveState {
	REMOVING = 'removing',
	REMOVE_FAILED = 'remove-failed',
}

export enum RunState {
	LAUNCHING = 'launching',
	RUNNING = 'running',
}

export type DbField = {
	id: 'id';
	game_id: 'game_id';
	title: 'title';
	description: 'description';
	release: 'release';
	build: 'build';
	file: 'file';
	launch_options: 'launch_options';
	install_dir: 'install_dir';
	install_state: 'install_state';
	update_state: 'update_state';
	remove_state: 'remove_state';
	update: 'update';
	download_progress: 'download_progress';
	unpack_progress: 'unpack_progress';
	patch_paused: 'patch_paused';
	patch_queued: 'patch_queued';
	run_state: 'run_state';
	running_pid: 'running_pid';
};

export const DbFieldMapping: DbField = {
	id: 'id',
	game_id: 'game_id',
	title: 'title',
	description: 'description',
	release: 'release',
	build: 'build',
	file: 'file',
	launch_options: 'launch_options',
	install_dir: 'install_dir',
	install_state: 'install_state',
	update_state: 'update_state',
	remove_state: 'remove_state',
	update: 'update',
	download_progress: 'download_progress',
	unpack_progress: 'unpack_progress',
	patch_paused: 'patch_paused',
	patch_queued: 'patch_queued',
	run_state: 'run_state',
	running_pid: 'running_pid',
};

export type DbFieldTypes = { [key in keyof DbField]: LocalDbPackage[DbField[key]] };

export interface BuildData {
	id: number;
	folder: string;
	type: string;
	archive_type: string;
	os_windows: boolean;
	os_windows_64: boolean;
	os_mac: boolean;
	os_mac_64: boolean;
	os_linux: boolean;
	os_linux_64: boolean;
	os_other: boolean;
	modified_on: number;
}

export class LocalDbPackage {
	install_dir = '';
	install_state: PatchState | null = null;
	update_state: PatchState | null = null;
	remove_state: RemoveState | null = null;
	update: LocalDbPackage | null = null;
	download_progress: Progress | null = null;
	unpack_progress: Progress | null = null;
	patch_paused: boolean | null = null;
	patch_queued: boolean | null = null;
	run_state: RunState | null = null;
	running_pid: Pid | null = null;

	id = 0;
	game_id = 0;
	title = '';
	description = '';

	release = {
		id: 0,
		version_number: '',
	};

	private _build: GameBuild | null = null;

	build: BuildData = {
		id: 0,
		folder: '',
		type: '',
		archive_type: '',
		os_windows: false,
		os_windows_64: false,
		os_mac: false,
		os_mac_64: false,
		os_linux: false,
		os_linux_64: false,
		os_other: false,
		modified_on: 0,
	};

	file = {
		id: 0,
		filename: '',
		filesize: '',
	};

	launch_options: {
		id: number;
		os: string;
		executable_path: string;
	}[] = [];

	static fromPackageInfo(
		package_: GamePackage,
		release: GameRelease,
		build: GameBuild,
		launchOptions: GameBuildLaunchOption[]
	) {
		const localPackage = new LocalDbPackage();
		localPackage.setData(package_, release, build, launchOptions);
		return localPackage;
	}

	static createForInstall(
		package_: GamePackage,
		release: GameRelease,
		build: GameBuild,
		launchOptions: GameBuildLaunchOption[]
	) {
		const localPackage = this.fromPackageInfo(package_, release, build, launchOptions);
		localPackage.setPackageFields({
			install_state: PatchState.PATCH_PENDING,
		});

		return localPackage;
	}

	static createForUpdate(
		package_: GamePackage,
		release: GameRelease,
		build: GameBuild,
		launchOptions: GameBuildLaunchOption[]
	) {
		const localPackage = this.fromPackageInfo(package_, release, build, launchOptions);
		localPackage.setPackageFields({
			update_state: PatchState.PATCH_PENDING,
		});

		return localPackage;
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

	get isSettled() {
		return !this.install_state && !this.update_state && !this.remove_state;
	}

	get isPatching() {
		return (
			this.install_state === PatchState.PATCH_PENDING ||
			this.install_state === PatchState.DOWNLOADING ||
			this.install_state === PatchState.UNPACKING ||
			this.update_state === PatchState.PATCH_PENDING ||
			this.update_state === PatchState.DOWNLOADING ||
			this.update_state === PatchState.UNPACKING
		);
	}

	get isInstalling() {
		return (
			this.install_state === PatchState.PATCH_PENDING ||
			this.install_state === PatchState.DOWNLOADING ||
			this.install_state === PatchState.UNPACKING
		);
	}

	get isUpdating() {
		return (
			this.update_state === PatchState.PATCH_PENDING ||
			this.update_state === PatchState.DOWNLOADING ||
			this.update_state === PatchState.UNPACKING
		);
	}

	get isDownloading() {
		return (
			this.install_state === PatchState.DOWNLOADING || this.update_state === PatchState.DOWNLOADING
		);
	}

	get isUnpacking() {
		return (
			this.install_state === PatchState.UNPACKING || this.update_state === PatchState.UNPACKING
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
			this.install_state === PatchState.DOWNLOAD_FAILED ||
			this.install_state === PatchState.UNPACK_FAILED
		);
	}

	get didUpdateFail() {
		return (
			this.update_state === PatchState.DOWNLOAD_FAILED ||
			this.update_state === PatchState.UNPACK_FAILED
		);
	}

	get isRunning() {
		return this.run_state || !!this.running_pid;
	}

	get isRemoving() {
		return this.remove_state === RemoveState.REMOVING;
	}

	setData(
		package_: GamePackage,
		release: GameRelease,
		build: GameBuild,
		launchOptions: GameBuildLaunchOption[]
	) {
		// All launch options are passed in.
		// Let's just pull the ones for our build.
		const _launchOptions: typeof LocalDbPackage.prototype.launch_options = [];
		for (let launchOption of launchOptions) {
			if (launchOption.game_build_id !== build.id) {
				continue;
			}

			_launchOptions.push({
				id: launchOption.id,
				os: launchOption.os,
				executable_path: launchOption.executable_path,
			});
		}

		this.setPackageFields({
			id: package_.id,
			game_id: package_.game_id,
			title: package_.title,
			description: package_.description,

			release: {
				id: release.id,
				version_number: release.version_number,
			},

			build: {
				id: build.id,
				folder: build.folder,
				type: build.type,
				archive_type: build.archive_type,
				os_windows: build.os_windows,
				os_windows_64: build.os_windows_64,
				os_mac: build.os_mac,
				os_mac_64: build.os_mac_64,
				os_linux: build.os_linux,
				os_linux_64: build.os_linux_64,
				os_other: build.os_other,
				modified_on: build.modified_on,
			},

			file: {
				id: build.primary_file.id,
				filename: build.primary_file.filename,
				filesize: build.primary_file.filesize,
			},
			launch_options: _launchOptions,
		});
	}

	setAllDataAndSave(data: DbFieldTypes) {
		const release = data.release;
		const build = data.build;
		const file = data.file;

		return this.setPackageFieldsAndSave({
			id: data.id,
			game_id: data.game_id,
			title: data.title,
			description: data.description,

			release: {
				id: release.id,
				version_number: release.version_number,
			},

			build: {
				id: build.id,
				folder: build.folder,
				type: build.type,
				archive_type: build.archive_type,
				os_windows: build.os_windows,
				os_windows_64: build.os_windows_64,
				os_mac: build.os_mac,
				os_mac_64: build.os_mac_64,
				os_linux: build.os_linux,
				os_linux_64: build.os_linux_64,
				os_other: build.os_other,
				modified_on: build.modified_on,
			},

			file: {
				id: file.id,
				filename: file.filename,
				filesize: file.filesize,
			},
			launch_options: data.launch_options,
		});
	}

	getDownloadUrl() {
		if (this.install_state) {
			return GameBuild.getDownloadUrl(this.build.id, {
				forceDownload: true,
			});
		} else if (this.update_state) {
			if (!this.update) {
				throw new Error('Update build is not set');
			}

			return GameBuild.getDownloadUrl(this.update.build.id, {
				forceDownload: true,
			});
		}
		throw new Error('Not ready to get the package download url');
	}

	setBuildData(data: BuildData) {
		this.build = data;
		this._build = new GameBuild(data);
	}

	setInstallDir(dir: string) {
		return this.setPackageFieldsAndSave({
			install_dir: dir,
		});
	}

	setInstallState(state: PatchState) {
		return this.setPackageFieldsAndSave({
			install_state: state,
		});
	}

	setPatchPaused() {
		return this.setPackageFieldsAndSave({
			patch_paused: true,
		});
	}

	setPatchResumed() {
		return this.setPackageFieldsAndSave({
			patch_paused: false,
		});
	}

	setPatchQueued() {
		return this.setPackageFieldsAndSave({
			patch_queued: true,
		});
	}

	setPatchUnqueued() {
		return this.setPackageFieldsAndSave({
			patch_queued: false,
		});
	}

	setInstalled() {
		return this.setPackageFieldsAndSave({
			install_state: null,
			download_progress: null,
			unpack_progress: null,
			patch_paused: null,
			patch_queued: null,
		});
	}

	setUpdateState(state: PatchState) {
		return this.setPackageFieldsAndSave({
			update_state: state,
		});
	}

	setUpdated() {
		if (!this.update) {
			return Promise.reject(new Error('Update package does not exist'));
		}

		return this.setPackageFieldsAndSave({
			// Copy the fields from the update package
			id: this.update.id,
			game_id: this.update.game_id,
			title: this.update.title,
			description: this.update.description,
			release: this.update.release,
			build: this.update.build,
			file: this.update.file,
			launch_options: this.update.launch_options,

			// Nullify the update state variables, marking the package as fully updated.
			update: null,
			update_state: null,
			download_progress: null,
			unpack_progress: null,
			patch_paused: null,
			patch_queued: null,
		});
	}

	setUpdateAborted() {
		return this.setPackageFieldsAndSave({
			update: null,
			update_state: null,
			download_progress: null,
			unpack_progress: null,
			patch_paused: null,
			patch_queued: null,
		});
	}

	setLaunching() {
		return this.setPackageFieldsAndSave({
			run_state: RunState.LAUNCHING,
		});
	}

	setRunningPid(pid: Pid) {
		return this.setPackageFieldsAndSave({
			run_state: RunState.RUNNING,
			running_pid: pid,
		});
	}

	clearRunningPid() {
		return this.setPackageFieldsAndSave({
			run_state: null,
			running_pid: null,
		});
	}

	setRemoveState(state: RemoveState) {
		return this.setPackageFieldsAndSave({
			remove_state: state,
		});
	}

	startUpdate(newBuildId: number): ReturnTypePackageStartUpdate {
		return store.dispatch('clientLibrary/packageStartUpdate', [this, newBuildId]) as any;
	}

	uninstall(dbOnly: boolean): ReturnTypePackageUninstall {
		return store.dispatch('clientLibrary/packageUninstall', [this, dbOnly]) as any;
	}

	private setPackageFieldsAndSave(
		fields: Partial<DbFieldTypes>
	): ReturnTypeSetPackageFieldsAndSave {
		return store.dispatch('clientLibrary/setPackageFieldsAndSave', [this, fields]) as any;
	}

	private setPackageFields(fields: Partial<DbFieldTypes>) {
		store.commit('clientLibrary/setPackageFields', [this, fields]);
	}
}
