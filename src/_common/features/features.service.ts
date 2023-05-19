import { ref } from 'vue';
import { getCurrentServerTime } from '../../utils/server-time';
import { Api } from '../api/api.service';

class FeatureToggle {
	_lastFetchTime: number;
	readonly _fetchTimeout: number;

	_valueRef = ref<boolean | undefined>(this.defaultValue);

	constructor(
		public readonly name: string,
		private readonly defaultValue: boolean,
		{
			fetchTimeout = 0,
		}: {
			fetchTimeout?: number;
		} = {}
	) {
		this._lastFetchTime = 0;
		this._fetchTimeout = fetchTimeout;
	}

	get value() {
		return this._valueRef.value ?? this.defaultValue;
	}
}

export const featureMicrotransactions = new FeatureToggle('microtransactions', false, {
	fetchTimeout: 1_000 * 60,
});

export async function fetchFeatureToggles(
	features: FeatureToggle[],
	{
		ignoreInterval: ignoreFetchTimeout = false,
	}: {
		ignoreInterval?: boolean;
	} = {}
) {
	try {
		const now = getCurrentServerTime();
		let count = 0;

		const fields: Record<string, true> = {};

		for (const feature of features) {
			const lastFetched = feature._lastFetchTime;
			if (ignoreFetchTimeout || !lastFetched || now - lastFetched >= feature._fetchTimeout) {
				++count;
				feature._lastFetchTime = now;
				fields[feature.name] = true;
			}
		}

		if (!count) {
			// No features to fetch.
			return;
		}

		const response = await Api.sendFieldsRequest('/mobile/feature', fields, {
			detach: true,
		});

		for (const feature of features) {
			const value = response[feature.name];

			if (typeof value === 'boolean') {
				// Use the value backend responded with for this feature.
				feature._valueRef.value = value;
			} else {
				// Remove any backend-provided feature, causing this to fall
				// back to the default.
				feature._valueRef.value = undefined;
			}
		}
	} catch (e) {
		if (import.meta.env.DEV) {
			console.error('Failed to fetch feature toggles.', e, {
				features: features.map(i => i.name),
			});
		}
	}
}
