import { Api } from '~common/api/api.service';
import type { DeviceArch, DeviceOs } from '~common/device/device.service';
import { GameBuildFileModel } from '~common/game/build/file/file.model';
import { GameBuildLaunchOptionModel } from '~common/game/build/launch-option/launch-option.model';
import { GameBuildParamModel } from '~common/game/build/param/param.model';
import { GameModel } from '~common/game/game.model';
import { GamePackageModel } from '~common/game/package/package.model';
import { GameReleaseModel } from '~common/game/release/release.model';
import { Jolticon } from '~common/jolticon/AppJolticon.vue';
import { Model } from '~common/model/model.service';

export const GameBuildTypeDownloadable = 'downloadable';
export const GameBuildTypeHtml = 'html';
export const GameBuildTypeFlash = 'flash';
export const GameBuildTypeSilverlight = 'silverlight';
export const GameBuildTypeUnity = 'unity';
export const GameBuildTypeApplet = 'applet';
export const GameBuildTypeRom = 'rom';

export type GameBuildType =
	| typeof GameBuildTypeDownloadable
	| typeof GameBuildTypeHtml
	| typeof GameBuildTypeFlash
	| typeof GameBuildTypeSilverlight
	| typeof GameBuildTypeUnity
	| typeof GameBuildTypeApplet
	| typeof GameBuildTypeRom;

export const GameBuildStatusAdding = 'adding';
export const GameBuildStatusActive = 'active';
export const GameBuildStatusRemoved = 'removed';

export type GameBuildStatus =
	| typeof GameBuildStatusAdding
	| typeof GameBuildStatusActive
	| typeof GameBuildStatusRemoved;

export const GameBuildErrorMissingFields = 'missing-fields';
export const GameBuildErrorLaunchOptions = 'launch-options';
export const GameBuildErrorInvalidArchive = 'invalid-archive';
export const GameBuildErrorPasswordArchive = 'password-archive';
export const GameBuildErrorNotHtmlArchive = 'not-html-archive';

export type GameBuildError =
	| typeof GameBuildErrorMissingFields
	| typeof GameBuildErrorLaunchOptions
	| typeof GameBuildErrorInvalidArchive
	| typeof GameBuildErrorPasswordArchive
	| typeof GameBuildErrorNotHtmlArchive;

export const GameBuildBrowserTypes = [
	GameBuildTypeHtml,
	GameBuildTypeFlash,
	GameBuildTypeSilverlight,
	GameBuildTypeUnity,
	GameBuildTypeApplet,
];

export const GameBuildEmulatorGba = 'gba';
export const GameBuildEmulatorGbc = 'gbc';
export const GameBuildEmulatorGb = 'gb';
export const GameBuildEmulatorNes = 'nes';
export const GameBuildEmulatorVboy = 'vb';
export const GameBuildEmulatorGenesis = 'md';
export const GameBuildEmulatorSnes = 'snes';
export const GameBuildEmulatorZx = 'zx';
export const GameBuildEmulatorMsx = 'msx';
export const GameBuildEmulatorAtari2600 = 'atari2600';
export const GameBuildEmulatorC64 = 'c64';
export const GameBuildEmulatorCpc = 'cpc';

export type GameBuildEmulator =
	| typeof GameBuildEmulatorGba
	| typeof GameBuildEmulatorGbc
	| typeof GameBuildEmulatorGb
	| typeof GameBuildEmulatorNes
	| typeof GameBuildEmulatorVboy
	| typeof GameBuildEmulatorGenesis
	| typeof GameBuildEmulatorSnes
	| typeof GameBuildEmulatorZx
	| typeof GameBuildEmulatorMsx
	| typeof GameBuildEmulatorAtari2600
	| typeof GameBuildEmulatorC64
	| typeof GameBuildEmulatorCpc;

interface PlatformSupport {
	icon: Jolticon;
	tooltip: string;
	sort: number;
	arch?: string;
}

/**
 * Sort must start at 1 so that we can put their prefered OS as sort 0 later on.
 */
export const GameBuildPlatformSupportInfo: { [k: string]: PlatformSupport } = {
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
		sort: 31,
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

export const GameBuildEmulatorInfo = {
	[GameBuildEmulatorGb]: 'Game Boy',
	[GameBuildEmulatorGbc]: 'Game Boy Color',
	[GameBuildEmulatorGba]: 'Game Boy Advance',
	[GameBuildEmulatorNes]: 'NES',
	[GameBuildEmulatorSnes]: 'SNES',
	[GameBuildEmulatorVboy]: 'Virtual Boy',
	[GameBuildEmulatorGenesis]: 'Genesis/Mega Drive',
	[GameBuildEmulatorAtari2600]: 'Atari 2600',
	[GameBuildEmulatorZx]: 'ZX Spectrum',
	[GameBuildEmulatorC64]: 'Commodore 64',
	[GameBuildEmulatorCpc]: 'Amstrad CPC',
	[GameBuildEmulatorMsx]: 'MSX',
};

export class GameBuildModel extends Model {
	declare primary_file: GameBuildFileModel;
	params: GameBuildParamModel[] = [];
	declare errors?: GameBuildError[];
	declare game_id: number;
	declare game_package_id: number;
	declare game_release_id: number;
	declare archive_type: string;
	declare folder: string;
	declare type: GameBuildType;
	declare os_windows: boolean;
	declare os_windows_64: boolean;
	declare os_mac: boolean;
	declare os_mac_64: boolean;
	declare os_linux: boolean;
	declare os_linux_64: boolean;
	declare os_other: boolean;
	declare is_installer: boolean;
	declare emulator_type: GameBuildEmulator;
	declare embed_width: number;
	declare embed_height: number;
	declare embed_fit_to_screen: boolean;
	declare java_class_name: string;
	declare browser_disable_right_click: boolean;
	declare https_enabled: boolean;
	declare added_on: number;
	declare updated_on: number;
	declare modified_on: number;
	declare status: GameBuildStatus;

	// These fields get added only during GamePackagePayloadModel.
	declare _package?: GamePackageModel;
	declare _release?: GameReleaseModel;
	declare _launch_options?: GameBuildLaunchOptionModel[];

	constructor(data: any = {}) {
		super(data);

		if (data.primary_file) {
			this.primary_file = new GameBuildFileModel(data.primary_file);
		}

		this.params = [];
		if (data.params && Array.isArray(data.params) && data.params.length) {
			this.params = GameBuildParamModel.populate(data.params);
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

	/**
	 * Note: ROM games, despite being quick playable are not considered browser based.
	 */
	get isBrowserBased() {
		return GameBuildBrowserTypes.indexOf(this.type) !== -1;
	}

	get isDownloadable() {
		return !this.isBrowserBased;
	}

	hasError(error: GameBuildError) {
		return !!this.errors && this.errors.indexOf(error) !== -1;
	}

	getUrl(game: GameModel, page: string) {
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
		return GameBuildModel.getDownloadUrl(this.id, options);
	}
}

/**
 * Checks if the game build can be installed on the target device. Returns null if unknown.
 */
export function canInstallGameBuild(options: {
	build: GameBuildModel;
	/** If not given, will assume the build is compatible with the device. */
	os?: DeviceOs;
	/** If not given, will assume the build is compatible with the current arch. */
	arch?: DeviceArch;
	/** By default when using the desktop app installers are not supported. */
	allowInstallers?: boolean;
}) {
	const { build, os, arch, allowInstallers } = options;

	// The desktop app does not support installers.
	if (GJ_IS_DESKTOP_APP && !allowInstallers && build.is_installer) {
		return false;
	}

	if (!os) {
		return true;
	}

	return canRunGameBuild({ build, os, arch });
}

/**
 * Helper function to check if the game build can run on the target device.
 * Returns null if unknown.
 */
export function canRunGameBuild(options: {
	build: GameBuildModel;
	os: DeviceOs;
	/** If not given, will assume the build is compatible with the current arch. */
	arch?: DeviceArch;
}): boolean | null {
	const { build, os, arch } = options;

	if (os !== 'windows' && os !== 'mac' && os !== 'linux') {
		return null;
	}

	if (build[`os_${os}`]) {
		return true;
	}

	// If they are on 64bit, then we can check for 64bit only support as well.
	// If there is no arch (web site context) then we allow 64bit builds as well.
	if ((!arch || arch === '64') && build[`os_${os}_64`]) {
		return true;
	}

	return false;
}

export function $saveGameBuild(model: GameBuildModel) {
	const params = [model.game_id, model.game_package_id, model.game_release_id];
	if (!model.id) {
		return model.$_save(
			'/web/dash/developer/games/builds/save/' + params.join('/'),
			'gameBuild',
			{
				file: model.file,
			}
		);
	} else {
		// May or may not have an upload file on an edit.
		params.push(model.id);
		return model.$_save(
			'/web/dash/developer/games/builds/save/' + params.join('/'),
			'gameBuild'
		);
	}
}

export async function $removeGameBuild(model: GameBuildModel, game: GameModel) {
	const params = [model.game_id, model.game_package_id, model.game_release_id, model.id];
	const response = await model.$_remove(
		'/web/dash/developer/games/builds/remove/' + params.join('/')
	);

	if (game && response.game) {
		game.assign(response.game);
	}

	return response;
}
