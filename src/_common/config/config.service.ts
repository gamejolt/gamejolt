import { fetchAndActivate, getBoolean, getRemoteConfig } from 'firebase/remote-config';
import { getFirebaseApp } from '../firebase/firebase.service';

const _defaultConfigValues: Record<string, any> = {};

class ConfigOption<T = any> {
	constructor(public readonly name: string, public readonly defaultValue: T) {
		_defaultConfigValues[name] = defaultValue;
	}
}

class ConfigOptionBoolean extends ConfigOption<boolean> {
	get value() {
		if (!GJ_IS_SSR) {
			return getBoolean(_getFirebaseRemoteConfig(), this.name);
		}
		return this.defaultValue;
	}
}

/**
 * Whether or not the search autocomplete should show when typing.
 */
export const configHasAutocomplete = new ConfigOptionBoolean('has_search_autocomplete', true);

function _getFirebaseRemoteConfig() {
	return getRemoteConfig(getFirebaseApp());
}

/**
 * Should call this to initialize our config values with the remote config data.
 */
export function ensureConfig() {
	return (_initPromise ??= _init());
}

let _initPromise: Promise<void> | null = null;
async function _init() {
	if (GJ_IS_SSR) {
		return;
	}

	const config = _getFirebaseRemoteConfig();

	config.settings = {
		// We don't want to wait long since this will delay loading of all
		// content for now.
		fetchTimeoutMillis: 3_000,
		// The fallback is the default value (12 hours).
		minimumFetchIntervalMillis: GJ_BUILD_TYPE === 'development' ? 10 * 60 * 1_000 : 4_320_0000,
	};

	// Pull from the defaults that were set up before calling this function.
	config.defaultConfig = _defaultConfigValues;

	await fetchAndActivate(config);
}
