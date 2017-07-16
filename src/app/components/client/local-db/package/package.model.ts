import { GameBuild } from '../../../../../lib/gj-lib-client/components/game/build/build.model';
import { IDownloadProgress, IExtractProgress, IParsedWrapper } from 'client-voodoo';
import { Component } from 'vue-property-decorator';
import Vue from 'vue';

@Component({})
export class LocalDbPackage extends Vue {
	// Will be used for install_state and update_state.
	static readonly PATCH_PENDING = 'patch-pending';
	static readonly DOWNLOADING = 'downloading';
	static readonly DOWNLOAD_FAILED = 'download-failed';
	static readonly DOWNLOADED = 'downloaded';
	static readonly UNPACKING = 'unpacking';
	static readonly UNPACK_FAILED = 'unpack-failed';
	static readonly UNPACKED = 'unpacked';

	static readonly REMOVING = 'removing';
	static readonly REMOVE_FAILED = 'remove-failed';

	install_dir: string | null = null;
	install_state: string | null = null;
	update_state: string | null = null;
	remove_state: string | null = null;
	update: LocalDbPackage | null = null;
	download_progress: IDownloadProgress | null = null;
	unpack_progress: IExtractProgress | null = null;
	patch_paused: boolean | null = null;
	patch_queued: boolean | null = null;
	running_pid: IParsedWrapper | null = null;

	id = 0;
	game_id = 0;
	title = '';
	description = '';

	release = {
		id: 0,
		version_number: '',
	};

	build = {
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

	get isSettled() {
		return !this.install_state && !this.update_state && !this.remove_state;
	}

	get isPatching() {
		return (
			this.install_state === LocalDbPackage.PATCH_PENDING ||
			this.install_state === LocalDbPackage.DOWNLOADING ||
			this.install_state === LocalDbPackage.UNPACKING ||
			this.update_state === LocalDbPackage.PATCH_PENDING ||
			this.update_state === LocalDbPackage.DOWNLOADING ||
			this.update_state === LocalDbPackage.UNPACKING
		);
	}

	get isInstalling() {
		return (
			this.install_state === LocalDbPackage.PATCH_PENDING ||
			this.install_state === LocalDbPackage.DOWNLOADING ||
			this.install_state === LocalDbPackage.UNPACKING
		);
	}

	get isUpdating() {
		return (
			this.update_state === LocalDbPackage.PATCH_PENDING ||
			this.update_state === LocalDbPackage.DOWNLOADING ||
			this.update_state === LocalDbPackage.UNPACKING
		);
	}

	get isDownloading() {
		return (
			this.install_state === LocalDbPackage.DOWNLOADING ||
			this.update_state === LocalDbPackage.DOWNLOADING
		);
	}

	get isUnpacking() {
		return (
			this.install_state === LocalDbPackage.UNPACKING ||
			this.update_state === LocalDbPackage.UNPACKING
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
			this.install_state === LocalDbPackage.DOWNLOAD_FAILED ||
			this.install_state === LocalDbPackage.UNPACK_FAILED
		);
	}

	get didUpdateFail() {
		return (
			this.update_state === LocalDbPackage.DOWNLOAD_FAILED ||
			this.update_state === LocalDbPackage.UNPACK_FAILED
		);
	}

	get isRunning() {
		return !!this.running_pid;
	}

	get isRemoving() {
		return this.remove_state === LocalDbPackage.REMOVING;
	}
}
