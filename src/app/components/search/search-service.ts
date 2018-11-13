import { Api } from '../../../lib/gj-lib-client/components/api/api.service';
import { makeObservableService } from '../../../lib/gj-lib-client/utils/vue';
import { store } from '../../store/index';
import { SearchPayload } from './payload-service';

export interface SearchOptions {
	type: 'all' | 'user' | 'game' | 'typeahead';
	page?: number;
}

export class Search {
	static query = '';

	static globalQuery(query: string) {
		if (typeof query === 'undefined') {
			return this.query;
		}

		this.query = query;
	}

	static async search(query: string, options: SearchOptions = { type: 'all' }) {
		let searchPromises: Promise<any>[] = [];
		searchPromises.push(this._searchSite(query, options));

		// If we're in client, let's try to search their installed games.
		if (GJ_IS_CLIENT && options.type && options.type === 'typeahead') {
			searchPromises.push(this.searchInstalledGames(query));
		}

		const _payload = await Promise.all(searchPromises);

		let searchPayload = _payload[0];
		const libraryPayload = _payload.length > 1 ? _payload[1] : null;

		searchPayload.libraryGames = libraryPayload || [];

		return new SearchPayload(options.type, searchPayload);
	}

	private static async _searchSite(
		query: string,
		options: SearchOptions = { type: 'all' }
	): Promise<any> {
		let requestOptions: any = {};

		let endpoint = '/web/search';
		if (options.type === 'user') {
			endpoint += '/users';
		} else if (options.type === 'game') {
			endpoint += '/games';
		} else if (options.type === 'typeahead') {
			endpoint += '/typeahead';
			requestOptions.detach = true;
		}

		let searchParams = ['q=' + encodeURIComponent(query || '')];

		if (options.page && options.page > 1) {
			searchParams.push('page=' + options.page);
		}

		// Catch failures and return an empty success instead.
		try {
			return await Api.sendRequest(
				endpoint + '?' + searchParams.join('&'),
				null,
				requestOptions
			);
		} catch (_e) {
			return Promise.resolve({});
		}
	}

	private static async searchInstalledGames(query: string) {
		return store.state.clientLibrary.searchInstalledGames(query, 3);
	}
}

makeObservableService(Search);
