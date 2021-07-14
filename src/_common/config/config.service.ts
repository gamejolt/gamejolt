import { fetchAndActivate, getRemoteConfig, getValue } from 'firebase/remote-config';
import { trackExperiments } from '../analytics/analytics.service';
import { getFirebaseApp } from '../firebase/firebase.service';

const _options: ConfigOption[] = [];
const JOIN_OPTIONS_STORAGE_KEY = 'config:join-options';

interface Conditions {
	/**
	 * Will only use the remote value if the user joined after this config was
	 * shipped (new users). Will still use the remote value if they log out as
	 * long as they joined previously while this config was active.
	 *
	 * If multiple users use the same browser, this could change things around
	 * if they create a new account.
	 */
	join?: boolean;
}

abstract class ConfigOption<T = any> {
	constructor(
		public readonly name: string,
		public readonly defaultValue: T,
		public readonly conditions?: Conditions
	) {
		_options.push(this);
	}

	/**
	 * Helper to return the value for this config option in child classes. It
	 * does all the checks against conditions and what not.
	 */
	protected _getValue(getter: () => T): T {
		if (
			// If join condition was set, we need to make sure the current
			// config option was set at the time of join or not. Only use the
			// remote value if it was.
			this.conditions?.join &&
			!_getJoinOptions().includes(this.name)
		) {
			return this.defaultValue;
		}

		return getter();
	}

	abstract get value(): any;
}

class ConfigOptionBoolean extends ConfigOption<boolean> {
	get value() {
		if (GJ_IS_SSR) {
			return this.defaultValue;
		}

		return this._getValue(() => getValue(_getFirebaseRemoteConfig(), this.name).asBoolean());
	}
}

/**
 * Whether or not the search autocomplete should show when typing.
 */
export const configHasAutocomplete = new ConfigOptionBoolean('has_search_autocomplete', true, {
	join: true,
});

/**
 * Whether or not to show who to follow on the feed.
 */
export const configWhoToFollow = new ConfigOptionBoolean('who_to_follow', true, {
	join: true,
});

export const configDiscoverCommunityChunks = new ConfigOptionBoolean(
	'discover_community_chunks',
	false
);

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
	for (const option of _options) {
		config.defaultConfig[option.name] = option.defaultValue;
	}

	await fetchAndActivate(config);

	const activeOptions: Record<string, string | number | boolean> = {};
	for (const option of _options) {
		activeOptions[option.name] = option.value;
	}

	console.log('Got remote config data.', activeOptions);
	trackExperiments(activeOptions);
}

/**
 * Should be called when the user joins to save the current configs so we know
 * what was active when they first joined.
 */
export function configSaveJoinOptions() {
	if (GJ_IS_SSR) {
		return;
	}

	localStorage.setItem(JOIN_OPTIONS_STORAGE_KEY, _options.map(i => i.name).join('|'));
}

let _joinOptions: string[] | null;
function _getJoinOptions() {
	if (GJ_IS_SSR) {
		return [];
	}

	return (_joinOptions ??= (localStorage.getItem(JOIN_OPTIONS_STORAGE_KEY) ?? '').split('|'));
}
