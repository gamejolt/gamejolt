import { arrayRemove } from '../../utils/array';
import { isPromise } from '../../utils/utils';
import { Api } from '../api/api.service';

/**
 * The type of source passed into the hydrator, not what the resulting hydration data will be.
 */
export type ContentHydrationType =
	| 'media-item-id'
	| 'username'
	| 'soundcloud-track-url'
	| 'soundcloud-track-id';

export type ContentHydrationDataEntry = {
	type: ContentHydrationType;
	source: string;
	data: any;
};

export class ContentHydrator {
	public hydration: ContentHydrationDataEntry[];

	constructor(hydration: ContentHydrationDataEntry[] = []) {
		this.hydration = [];
		for (const entry of hydration) {
			if (entry.data) {
				this.hydration.push(entry);
			}
		}
	}

	/**
	 * Resolves the data returned by `getData`.
	 */
	async useData<T>(type: ContentHydrationType, source: string, callback: (data: T) => void) {
		const result = this.getData(type, source);
		let data;
		if (isPromise(result)) {
			data = await result;
		} else {
			data = result;
		}
		callback(data);
	}

	// Need to return data sync because SSR has to never execute a promise during created.
	getData(type: ContentHydrationType, source: string) {
		// Try to find hydration in existing pool
		// If it's dry, request hydration from the server

		const existingEntry = this.hydration.find(i => i.type === type && i.source === source);
		if (existingEntry) {
			return existingEntry.data;
		}

		const postData = {
			type,
			source,
		};

		return Api.sendRequest(`/web/content/hydrate`, postData, {
			noErrorRedirect: true,
		}).then(result => {
			const entry = {
				type,
				source,
				data: result.data,
			} as ContentHydrationDataEntry;
			this.hydration.push(entry);
			return entry.data;
		});
	}

	dry(type: ContentHydrationType, id: string) {
		arrayRemove(this.hydration, i => i.type === type && i.source === id);
	}
}
