import { Api } from '../../api/api.service';
import { Jolticon } from '../../jolticon/AppJolticon.vue';
import { Model } from '../../model/model.service';
import { Game } from '../game.model';
import { GamePackage } from '../package/package.model';
import { GameRelease } from '../release/release.model';
import { GameBuildFile } from './file/file.model';
import { GameBuildLaunchOption } from './launch-option/launch-option.model';
import { GameBuildParam } from './param/param.model';

interface PlatformSupport {
	icon: Jolticon;
	tooltip: string;
	sort: number;
	arch?: string;
}

export class GameBuild extends Model {
	static readonly TYPE_DOWNLOADABLE = 'downloadable';
	static readonly TYPE_HTML = 'html';
	static readonly TYPE_FLASH = 'flash';
	static readonly TYPE_SILVERLIGHT = 'silverlight';
	static readonly TYPE_UNITY = 'unity';
	static readonly TYPE_APPLET = 'applet';
	static readonly TYPE_ROM = 'rom';

	static readonly STATUS_ADDING = 'adding';
	static readonly STATUS_ACTIVE = 'active';
	static readonly STATUS_REMOVED = 'removed';

	static readonly ERROR_MISSING_FIELDS = 'missing-fields';
	static readonly ERROR_LAUNCH_OPTIONS = 'launch-options';
	static readonly ERROR_INVALID_ARCHIVE = 'invalid-archive';
	static readonly ERROR_PASSWORD_ARCHIVE = 'password-archive';
	static readonly ERROR_NOT_HTML_ARCHIVE = 'not-html-archive';

	static readonly browserTypes = [
		GameBuild.TYPE_HTML,
		GameBuild.TYPE_FLASH,
		GameBuild.TYPE_SILVERLIGHT,
		GameBuild.TYPE_UNITY,
		GameBuild.TYPE_APPLET,
	];

	static readonly EMULATOR_GBA = 'gba';
	static readonly EMULATOR_GBC = 'gbc';
	static readonly EMULATOR_GB = 'gb';
	static readonly EMULATOR_NES = 'nes';
	static readonly EMULATOR_VBOY = 'vb';
	static readonly EMULATOR_GENESIS = 'md';
	static readonly EMULATOR_SNES = 'snes';
	static readonly EMULATOR_ZX = 'zx';
	static readonly EMULATOR_MSX = 'msx';
	static readonly EMULATOR_ATARI2600 = 'atari2600';
	static readonly EMULATOR_C64 = 'c64';
	static readonly EMULATOR_CPC = 'cpc';

	/**
	 * Sort must start at 1 so that we can put their prefered OS as sort 0 later on.
	 */
	static readonly platformSupportInfo: { [k: string]: PlatformSupport } = {
		windows: {
			icon: 'windows',
			tooltip: 'Windows',
			sort: 10,
		},
		windows_64: {
			icon: 'windows',
			tooltip: 'Windows 64-bit',
			arch: '64',
			sort: 11,
		},
		mac: {
			icon: 'mac',
			tooltip: 'macOS',
			sort: 20,
		},
		mac_64: {
			icon: 'mac',
			tooltip: 'macOS 64-bit',
			arch: '64',
			sort: 21,
		},
		linux: {
			icon: 'linux',
			tooltip: 'Linux',
			sort: 30,
		},
		linux_64: {
			icon: 'linux',
			tooltip: 'Linux 64-bit',
			arch: '64',
			sort: 30,
		},
		other: {
			icon: 'other-os',
			tooltip: 'Downloadable File',
			sort: 40,
		},
		html: {
			icon: 'html5',
			tooltip: 'Web Playable',
			sort: 50,
		},
		flash: {
			icon: 'flash',
			tooltip: 'Flash Web Playable',
			sort: 51,
		},
		unity: {
			icon: 'unity',
			tooltip: 'Unity Web Playable',
			sort: 52,
		},
		applet: {
			icon: 'java',
			tooltip: 'Java Applet Web Playable',
			sort: 53,
		},
		silverlight: {
			icon: 'silverlight',
			tooltip: 'Silverlight Web Playable',
			sort: 54,
		},
		rom: {
			icon: 'rom',
			tooltip: 'ROM',
			sort: 60,
		},
		steam: {
			icon: 'steam',
			tooltip: 'Steam Key',
			sort: 70,
		},
	};

	static readonly emulatorInfo: { [k: string]: string } = {
		[GameBuild.EMULATOR_GB]: 'Game Boy',
		[GameBuild.EMULATOR_GBC]: 'Game Boy Color',
		[GameBuild.EMULATOR_GBA]: 'Game Boy Advance',
		[GameBuild.EMULATOR_NES]: 'NES',
		[GameBuild.EMULATOR_SNES]: 'SNES',
		[GameBuild.EMULATOR_VBOY]: 'Virtual Boy',
		[GameBuild.EMULATOR_GENESIS]: 'Genesis/Mega Drive',
		[GameBuild.EMULATOR_ATARI2600]: 'Atari 2600',
		[GameBuild.EMULATOR_ZX]: 'ZX Spectrum',
		[GameBuild.EMULATOR_C64]: 'Commodore 64',
		[GameBuild.EMULATOR_CPC]: 'Amstrad CPC',
		[GameBuild.EMULATOR_MSX]: 'MSX',
	};

	primary_file!: GameBuildFile;
	params: GameBuildParam[] = [];
	errors?: string[];

	game_id!: number;
	game_package_id!: number;
	game_release_id!: number;
	archive_type!: string;
	folder!: string;
	type!: string;
	os_windows!: boolean;
	os_windows_64!: boolean;
	os_mac!: boolean;
	os_mac_64!: boolean;
	os_linux!: boolean;
	os_linux_64!: boolean;
	os_other!: boolean;
	emulator_type!: string;
	embed_width!: number;
	embed_height!: number;
	embed_fit_to_screen!: boolean;
	java_class_name!: string;
	browser_disable_right_click!: boolean;
	https_enabled!: boolean;
	added_on!: number;
	updated_on!: number;
	modified_on!: number;
	status!: string;

	// These fields get added only during GamePackagePayloadModel.
	_package?: GamePackage;
	_release?: GameRelease;
	_launch_options?: GameBuildLaunchOption[];

	static pluckOsSupport(build: GameBuild) {
		const support = [];

		// We only include the 64-bit versions if the build doesn't have 32bit and 64bit
		// on the same build. That basically just means it's a universal build.

		if (build.os_windows) {
			support.push('windows');
		}

		if (build.os_windows_64 && !build.os_windows) {
			support.push('windows_64');
		}

		if (build.os_mac) {
			support.push('mac');
		}

		if (build.os_mac_64 && !build.os_mac) {
			support.push('mac_64');
		}

		if (build.os_linux) {
			support.push('linux');
		}

		if (build.os_linux_64 && !build.os_linux) {
			support.push('linux_64');
		}

		if (build.os_other) {
			support.push('other');
		}

		return support;
	}

	static checkPlatformSupport(support: string[], type: string) {
		return support.indexOf(type) !== -1;
	}

	constructor(data: any = {}) {
		super(data);

		if (data.primary_file) {
			this.primary_file = new GameBuildFile(data.primary_file);
		}

		this.params = [];
		if (data.params && Array.isArray(data.params) && data.params.length) {
			this.params = GameBuildParam.populate(data.params);
		}

		if (data.errors && typeof data.errors === 'string') {
			this.errors = data.errors.split(',');
		}
	}

	isPlatform(os: string, arch?: string) {
		if (os === 'windows') {
			return arch === '64' ? !!this.os_windows_64 : !!this.os_windows;
		} else if (os === 'mac') {
			return arch === '64' ? !!this.os_mac_64 : !!this.os_mac;
		} else if (os === 'linux') {
			return arch === '64' ? !!this.os_linux_64 : !!this.os_linux;
		}
		return false;
	}

	get isDownloadable() {
		return !this.isBrowserBased;
	}

	get isBrowserBased() {
		return GameBuild.browserTypes.indexOf(this.type) !== -1;
	}

	get isRom() {
		return this.type === GameBuild.TYPE_ROM;
	}

	hasError(error: string) {
		return !!this.errors && this.errors.indexOf(error) !== -1;
	}

	getUrl(game: Game, page: string) {
		if (page === 'download') {
			return `/get/build?game=${game.id}&build=${this.id}`;
		}

		return undefined;
	}

	static getDownloadUrl(id: number, options: { key?: string; forceDownload?: boolean } = {}) {
		// This is a game key so you can access games that you have a key for.
		const data: any = {};
		if (options.key) {
			data.key = options.key;
		}

		if (options.forceDownload) {
			data.forceDownload = true;
		}

		return Api.sendRequest('/web/discover/games/builds/get-download-url/' + id, data);
	}

	getDownloadUrl(options: { key?: string; forceDownload?: boolean } = {}) {
		return GameBuild.getDownloadUrl(this.id, options);
	}

	$save() {
		const params = [this.game_id, this.game_package_id, this.game_release_id];
		if (!this.id) {
			return this.$_save(
				'/web/dash/developer/games/builds/save/' + params.join('/'),
				'gameBuild',
				{
					file: this.file,
				}
			);
		} else {
			// May or may not have an upload file on an edit.
			params.push(this.id);
			return this.$_save(
				'/web/dash/developer/games/builds/save/' + params.join('/'),
				'gameBuild'
			);
		}
	}

	async $remove(game: Game) {
		const params = [this.game_id, this.game_package_id, this.game_release_id, this.id];
		const response = await this.$_remove(
			'/web/dash/developer/games/builds/remove/' + params.join('/')
		);

		if (game && response.game) {
			game.assign(response.game);
		}

		return response;
	}
}

Model.create(GameBuild);
