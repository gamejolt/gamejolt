import * as nodePath from 'path';

const STORAGE_PREFIX = 'settings.';

type SettingType = string | number | boolean;

abstract class SettingBase<T extends SettingType> {
	constructor(public readonly key: string, public readonly _defaultValue: T | (() => T)) {}

	public abstract set(value: T): void;
	public abstract get(): T;

	protected _set(val: string) {
		if (!GJ_IS_SSR) {
			localStorage.setItem(STORAGE_PREFIX + this.key, val);
		}
	}

	protected _get() {
		if (!GJ_IS_SSR && localStorage.getItem(STORAGE_PREFIX + this.key) !== null) {
			return localStorage.getItem(STORAGE_PREFIX + this.key);
		} else {
			return this.defaultValue;
		}
	}

	get defaultValue() {
		if (typeof this._defaultValue === 'function') {
			return this._defaultValue();
		}

		return this._defaultValue;
	}
}

class StringSetting extends SettingBase<string> {
	set(val: string) {
		this._set(`${val}`);
	}

	get() {
		return `${this._get()}`;
	}
}

class NumberSetting extends SettingBase<number> {
	set(val: number) {
		this._set(`${val}`);
	}

	get() {
		const val = this._get();
		return typeof val === 'string' ? parseFloat(val) : val ?? 0;
	}
}

class BooleanSetting extends SettingBase<boolean> {
	set(val: boolean) {
		this._set(val ? '1' : '0');
	}

	get() {
		const val = this._get();
		return val === '0' ? false : !!val;
	}
}

export const SettingThemeDark = new BooleanSetting('theme-dark', true);
export const SettingThemeAlwaysOurs = new BooleanSetting('theme-always-ours', false);
export const SettingAlwaysShowStickers = new BooleanSetting('always-show-stickers', false);
export const SettingGameInstallDir = new StringSetting('game-install-dir', () => {
	const path = require('path') as typeof nodePath;
	const dataPath = nw.App.dataPath;

	return path.join(dataPath, 'Games');
});
export const SettingMaxDownloadCount = new NumberSetting('max-download-count', 5);
export const SettingMaxExtractCount = new NumberSetting('max-extract-count', 1);
export const SettingQueueWhenPlaying = new BooleanSetting('queue-when-playing', true);
export const SettingAutostartClient = new BooleanSetting('autostart-client', true);
export const SettingChatGroupShowMembers = new BooleanSetting('chat-group-show-members', true);
export const SettingRestrictedBrowsing = new BooleanSetting('restricted-browsing', true);
export const SettingBroadcastModal = new BooleanSetting('broadcast-modal', true);
export const SettingAnimatedThumbnails = new BooleanSetting('animated-thumbnails', true);
export const SettingFeedNotifications = new BooleanSetting('feed-notifications', true);
// Video Players
export const SettingVideoPlayerVolume = new NumberSetting('video-player-volume', 1);
export const SettingVideoPlayerMuted = new BooleanSetting('video-player-muted', false);
export const SettingVideoPlayerFeedVolume = new NumberSetting('video-player-feed-volume', 0);
export const SettingVideoPlayerFeedMuted = new BooleanSetting('video-player-feed-muted', true);
export const SettingVideoPlayerFeedAutoplay = new BooleanSetting(
	'video-player-feed-autoplay',
	true
);
