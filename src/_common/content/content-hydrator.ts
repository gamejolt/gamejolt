import { arrayRemove } from '../../utils/array';
import { isPromise } from '../../utils/utils';
import { Api } from '../api/api.service';
import { ContentEditorAppAdapterMessage, editorGetAppAdapter } from './content-editor/app-adapter';

/**
 * The type of source passed into the hydrator, not what the resulting hydration data will be.
 */
export type ContentHydrationType =
	| 'media-item-id'
	| 'username'
	| 'soundcloud-track-url'
	| 'soundcloud-track-id'
	| 'emoji-id'
	| 'sticker-id'
	| 'chat-invite';

export type ContentHydrationDataEntry = {
	type: ContentHydrationType;
	source: string;
	data: any;
};

export class ContentHydrator {
	public hydration: ContentHydrationDataEntry[];
	public hydrationRequests = new Map<string, ContentHydrationRequest>();

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

		const requestKey = ContentHydrationRequest.makeKey(type, source);

		// We only allow one hydration request to get created.
		if (!this.hydrationRequests.has(requestKey)) {
			const hydrationRequest = new ContentHydrationRequest();

			if (!GJ_IS_MOBILE_APP) {
				// Calling the setData will finalize the hydration request.
				Api.sendRequest(`/web/content/hydrate`, postData, {
					noErrorRedirect: true,
				}).then(result => this.setData(type, source, result.data));
			} else {
				// The app will get a message over the adapter channel with the
				// response and will eventually call [setData] which will
				// resolve the request.
				const msg = ContentEditorAppAdapterMessage.requestHydration(type, source);
				editorGetAppAdapter().send(msg);
			}

			this.hydrationRequests.set(requestKey, hydrationRequest);
		}

		return this.hydrationRequests.get(requestKey)!.promise;
	}

	setData(type: ContentHydrationType, source: string, data: any) {
		const entry = {
			type,
			source,
			data,
		} as ContentHydrationDataEntry;

		this.hydration.push(entry);

		// If there was a hydration request active, let's resolve it with the
		// data we have.
		const requestKey = ContentHydrationRequest.makeKey(type, source);

		const hydrationRequest = this.hydrationRequests.get(requestKey);
		if (hydrationRequest) {
			hydrationRequest.resolveWithData(entry);
			this.hydrationRequests.delete(requestKey);
		}

		return entry;
	}

	dry(type: ContentHydrationType, id: string) {
		arrayRemove(this.hydration, i => i.type === type && i.source === id);
	}
}

class ContentHydrationRequest {
	/**
	 * The promise will resolve with the data that was returned for the
	 * hydration entry.
	 */
	readonly promise: Promise<any>;
	private resolver?: (entry: ContentHydrationDataEntry) => void;

	static makeKey = (type: ContentHydrationType, source: string) => `${type}:${source}`;

	constructor() {
		this.promise = new Promise(resolve => {
			this.resolver = resolve;
		});
	}

	resolveWithData(entry: ContentHydrationDataEntry) {
		this.resolver?.(entry.data);
	}
}
