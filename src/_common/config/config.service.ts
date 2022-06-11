import { fetchAndActivate, getRemoteConfig, getValue } from 'firebase/remote-config';
import { reactive } from 'vue';
import { HOME_FEED_ACTIVITY, HOME_FEED_FYP } from '../../app/views/home/home-feed.service';
import { getFirebaseApp } from '../firebase/firebase.service';

const ConfigService_ = {
	isLoaded: false,
	options: [] as ConfigOption[],
};
export const ConfigService = reactive(ConfigService_) as typeof ConfigService_;

const JOIN_OPTIONS_STORAGE_KEY = 'config:join-options';
const OVERRIDES_STORAGE_KEY = 'config:overrides';

type ValueType = number | string | boolean;

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

export abstract class ConfigOption<T extends ValueType = any> {
	public readonly conditions?: Conditions;

	constructor(
		public readonly name: string,
		public readonly defaultValue: T,
		{ conditions }: { conditions?: Conditions } = {}
	) {
		this.conditions = conditions;
		ConfigService.options.push(this);
	}

	/**
	 * The option is considered excluded depending on if its conditions match.
	 */
	get isExcluded() {
		if (
			// If join condition was set, we need to make sure the current
			// config option was set at the time of join or not. Only use the
			// remote value if it was.
			this.conditions?.join &&
			!_getJoinOptions().includes(this.name)
		) {
			return true;
		}

		return false;
	}

	/**
	 * If a dev has overridden this locally.
	 */
	get isOverridden() {
		return this.name in _configGetOverrides();
	}

	/**
	 * Helper to return the value for this config option in child classes. It
	 * does all the checks against conditions and what not.
	 */
	protected _getValue(getter: () => T): T {
		// If an override is specified locally.
		const overrides = _configGetOverrides();
		if (this.name in overrides) {
			return overrides[this.name] as T;
		}

		if (this.isExcluded) {
			return this.defaultValue;
		}

		return getter();
	}

	abstract get value(): any;
}

export class ConfigOptionBoolean extends ConfigOption<boolean> {
	get value() {
		if (import.meta.env.SSR) {
			return this.defaultValue;
		}

		return this._getValue(() => getValue(_getFirebaseRemoteConfig(), this.name).asBoolean());
	}
}

export class ConfigOptionString<T extends string = string> extends ConfigOption<T> {
	public readonly validValues: T[];

	constructor(
		name: string,
		defaultValue: T,
		{ validValues, conditions }: { validValues: T[]; conditions?: Conditions }
	) {
		super(name, defaultValue, { conditions: conditions });
		this.validValues = validValues;
	}

	get value() {
		if (import.meta.env.SSR) {
			return this.defaultValue;
		}

		return this._getValue(() => {
			const value = getValue(_getFirebaseRemoteConfig(), this.name).asString() as T;

			// If we don't know the value that we got from remote, we need to fallback to default.
			if (!this.validValues.includes(value)) {
				return this.defaultValue;
			}

			return value;
		});
	}
}

export const configRealms = new ConfigOptionBoolean('web_realms', false);

/** Whether or not we show the post share card on the side or inline */
export const configPostShareSide = new ConfigOptionBoolean('web_post_share_side', false);

/** Which feed do we default to for home */
export const configHomeDefaultFeed = new ConfigOptionString(
	'home_default_feed',
	HOME_FEED_ACTIVITY,
	{
		validValues: [HOME_FEED_ACTIVITY, HOME_FEED_FYP],
		conditions: { join: true },
	}
);

export const configCommunityFrontpageFeedType = new ConfigOptionString(
	'web_community_frontpage_feed_type',
	'default',
	{
		validValues: ['default', 'featured', 'featured-hot'],
		conditions: { join: true },
	}
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
	if (import.meta.env.SSR) {
		ConfigService.isLoaded = true;
		return;
	}

	// Getting the remote config DB set up could fail if there's no access to
	// indexeddb, so we need to handle that.
	try {
		const config = _getFirebaseRemoteConfig();

		config.settings = {
			// We don't want to wait long since this will delay loading of all
			// content for now.
			fetchTimeoutMillis: 3_000,
			// The fallback is the default value (12 hours).
			minimumFetchIntervalMillis:
				GJ_BUILD_TYPE === 'serve-hmr' || GJ_BUILD_TYPE === 'serve-build'
					? 10 * 60 * 1_000
					: 4_320_0000,
		};

		// Pull from the defaults that were set up before calling this function.
		for (const option of ConfigService.options) {
			config.defaultConfig[option.name] = option.defaultValue;
		}

		await fetchAndActivate(config);
	} catch (e) {
		// Do nothing.
	} finally {
		ConfigService.isLoaded = true;
	}
}

/**
 * Should be called when the user joins to save the current configs so we know
 * what was active when they first joined.
 */
export function configSaveJoinOptions() {
	if (import.meta.env.SSR) {
		return;
	}

	localStorage.setItem(
		JOIN_OPTIONS_STORAGE_KEY,
		ConfigService.options.map(i => i.name).join('|')
	);
}

let _joinOptions: undefined | string[];
function _getJoinOptions() {
	if (import.meta.env.SSR) {
		return [];
	}

	return (_joinOptions ??= (localStorage.getItem(JOIN_OPTIONS_STORAGE_KEY) ?? '').split('|'));
}

type Overrides = Record<string, ValueType>;
let _overrides: undefined | Overrides;

export function configSaveOverrides(overrides: Overrides) {
	if (import.meta.env.SSR) {
		return;
	}

	localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(overrides));

	// Bust local cache.
	_overrides = undefined;
}

function _configGetOverrides(): Overrides {
	if (import.meta.env.SSR) {
		return {};
	}

	return (_overrides ??= JSON.parse(localStorage.getItem(OVERRIDES_STORAGE_KEY) ?? '{}'));
}

/**
 * Save a single config's override value.
 */
export function configSaveOverride<T extends ValueType>(config: ConfigOption<T>, value: T) {
	const overrides = _configGetOverrides();
	overrides[config.name] = value;
	configSaveOverrides(overrides);
}
