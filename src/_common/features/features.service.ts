import { ref, Ref } from 'vue';
import { getCurrentServerTime } from '../../utils/server-time';
import { Api } from '../api/api.service';

class FeatureToggle {
	declare _lastFetchTime: number;
	declare readonly _fetchInterval: number;

	constructor(
		public readonly name: string,
		private readonly defaultValue: boolean,
		{
			fetchInterval = 0,
		}: {
			fetchInterval?: number;
		} = {}
	) {
		this._lastFetchTime = 0;
		this._fetchInterval = fetchInterval;
	}

	get value() {
		if (typeof featureToggleValues.value[this.name] === 'boolean') {
			return featureToggleValues.value[this.name];
		}
		return this.defaultValue;
	}
}

const featureToggleValues = ref({}) as Ref<Record<string, boolean>>;

export const featureMicrotransactions = new FeatureToggle('microtransactions', false, {
	fetchInterval: 1_000 * 60,
});

export async function fetchFeatureToggles(
	features: FeatureToggle[],
	{
		ignoreInterval = false,
	}: {
		ignoreInterval?: boolean;
	} = {}
) {
	try {
		const now = getCurrentServerTime();
		const fieldsKeys: string[] = [];
		const fields = features.reduce((result, i) => {
			const lastFetched = i._lastFetchTime;
			if (ignoreInterval || !lastFetched || now - lastFetched >= i._fetchInterval) {
				i._lastFetchTime = now;
				fieldsKeys.push(i.name);
				result[i.name] = true;
			}

			return result;
		}, {} as Record<string, true>);

		if (!fieldsKeys.length) {
			// No features to fetch.
			return;
		}

		const response = await Api.sendFieldsRequest('/mobile/feature', fields, {
			detach: true,
		});

		for (const field of fieldsKeys) {
			const value = response[field];
			if (typeof value === 'boolean') {
				// Use the value backend responded with for this feature.
				featureToggleValues.value[field] = value;
			} else {
				// Remove any backend-provided feature, causing this to fall
				// back to the default.
				delete featureToggleValues.value[field];
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
