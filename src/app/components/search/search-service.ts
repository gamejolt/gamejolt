import { Injectable, Inject } from 'ng-metadata/core';
import { SearchPayload } from './payload-service';
import { getProvider } from '../../../lib/gj-lib-client/utils/utils';
import { Api } from '../../../lib/gj-lib-client/components/api/api.service';

export interface SearchOptions
{
	type: 'all' | 'user' | 'game' | 'devlog' | 'typeahead';
	page?: number;
}

@Injectable( 'Search' )
export class Search
{
	Client_Library: any;
	query = '';

	constructor(
		@Inject( 'orderByFilter' ) private orderByFilter: ng.IFilterOrderBy,
		@Inject( 'Fuzzysearch' ) private fuzzysearch: any,
	)
	{
		this.Client_Library = GJ_IS_CLIENT ? getProvider( 'Client_Library' ) : undefined;
	}

	globalQuery( query: string )
	{
		if ( typeof query === 'undefined' ) {
			return this.query;
		}

		this.query = query;
	}

	async search( query: string, options: SearchOptions = { type: 'all' } )
	{
		let searchPromises: Promise<any>[] = [];
		searchPromises.push( this._searchSite( query, options ) );

		// If we're in client, let's try to search their installed games.
		if ( this.Client_Library && options.type && options.type == 'typeahead' ) {
			searchPromises.push( this._searchInstalledGames( query ) );
		}

		const _payload = await Promise.all( searchPromises );

		let searchPayload = _payload[0];
		const libraryPayload = _payload.length > 1 ? _payload[1] : null;

		searchPayload.libraryGames = libraryPayload || [];

		return new SearchPayload( options.type, searchPayload );
	}

	private async _searchSite( query: string, options: SearchOptions = { type: 'all' } ): Promise<any>
	{
		let requestOptions: any = {};

		let endpoint = '/web/search';
		if ( options.type == 'user' ) {
			endpoint += '/users';
		}
		else if ( options.type == 'game' ) {
			endpoint += '/games';
		}
		else if ( options.type == 'devlog' ) {
			endpoint += '/devlogs';
		}
		else if ( options.type == 'typeahead' ) {
			endpoint += '/typeahead';
			requestOptions.detach = true;
		}

		let searchParams = [
			'q=' + (query || ''),
		];

		if ( options.page && options.page > 1 ) {
			searchParams.push( 'page=' + options.page );
		}

		// Catch failures and return an empty success instead.
		try {
			return await Api.sendRequest( endpoint + '?' + searchParams.join( '&' ), null, requestOptions );
		}
		catch ( _e ) {
			return Promise.resolve( {} );
		}
	}

	private _searchInstalledGames( query: string ): Promise<any>
	{
		let games: any[] = [];

		for ( const game of this.Client_Library.games ) {
			if ( this.fuzzysearch( query.toLowerCase(), game.title.toLowerCase() ) ) {
				games.push( game );
			}
		}

		if ( games.length > 0 ) {
			games = this.orderByFilter( games, 'title' );
			games = _.take( games, 3 );  // Only return top 3.
		}

		return Promise.resolve( games );
	}
}
