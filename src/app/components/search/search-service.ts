import { reactive } from '@vue/reactivity';
import { Api } from '../../../_common/api/api.service';
import { SearchPayload } from './payload-service';

export interface SearchOptions {
	type: 'all' | 'user' | 'game' | 'community' | 'typeahead';
	page?: number;
}

class SearchService {
	query = '';
}

export const Search = reactive(new SearchService()) as SearchService;

export async function sendSearch(query: string, options: SearchOptions = { type: 'all' }) {
	const searchPromises: Promise<any>[] = [];
	searchPromises.push(_searchSite(query, options));

	// If we're in client, let's try to search their installed games.
	if (GJ_IS_DESKTOP_APP && options.type && options.type === 'typeahead') {
		searchPromises.push(_findInstalledGamesByTitle(query));
	}

	const payloads = await Promise.all(searchPromises);

	const searchPayload = payloads[0];
	const libraryPayload = payloads.length > 1 ? payloads[1] : null;

	searchPayload.libraryGames = libraryPayload || [];

	return new SearchPayload(options.type, searchPayload);
}

async function _searchSite(query: string, options: SearchOptions = { type: 'all' }): Promise<any> {
	const requestOptions: any = {};

	let endpoint = '/web/search';
	if (options.type === 'user') {
		endpoint += '/users';
	} else if (options.type === 'game') {
		endpoint += '/games';
	} else if (options.type === 'community') {
		endpoint += '/communities';
	} else if (options.type === 'typeahead') {
		endpoint += '/typeahead';
		requestOptions.detach = true;
	}

	const searchParams = ['q=' + encodeURIComponent(query || '')];

	if (options.page && options.page > 1) {
		searchParams.push('page=' + options.page);
	}

	// Catch failures and return an empty success instead.
	try {
		return await Api.sendRequest(endpoint + '?' + searchParams.join('&'), null, requestOptions);
	} catch (_e) {
		return Promise.resolve({});
	}
}

async function _findInstalledGamesByTitle(query: string) {
	// TODO(vue3): Yariv, this should get the client library injected somehow, yeah?
	// return appStore.clientLibrary.findInstalledGamesByTitle(query, 3);
}
