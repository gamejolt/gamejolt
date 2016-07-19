import { Injectable, Inject } from 'ng-metadata/core';
import { SearchPayload } from './payload-service';

export interface SearchOptions
{
	type: 'all' | 'user' | 'game' | 'typeahead';
	page?: number;
}

@Injectable()
export class Search
{
	Client_Library: any;
	query = '';

	constructor(
		@Inject( '$injector' ) $injector: any,
		@Inject( '$q' ) private $q: angular.IQService,
		@Inject( 'orderByFilter' ) private orderByFilter: angular.IFilterOrderBy,
		@Inject( 'Environment' ) environment: any,
		@Inject( 'Api' ) private api: any,
		@Inject( 'Fuzzysearch' ) private fuzzysearch: any,
		@Inject( 'SearchPayload' ) private searchPayload: typeof SearchPayload
	)
	{
		this.Client_Library = environment.isClient ? $injector.get( 'Client_Library' ) : null;
	}

	globalQuery( query: string )
	{
		if ( angular.isUndefined( query ) ) {
			return this.query;
		}

		this.query = query;
	}

	search( query: string, options: SearchOptions = { type: 'all' } )
	{
		let searchPromises: angular.IPromise<any>[] = [];
		searchPromises.push( this._searchSite( query, options ) );

		// If we're in client, let's try to search their installed games.
		if ( this.Client_Library && options.type && options.type == 'typeahead' ) {
			searchPromises.push( this._searchInstalledGames( query ) );
		}

		return this.$q.all( searchPromises )
			.then( _payload =>
			{
				const searchPayload = _payload[0];
				const libraryPayload = _payload.length > 1 ? _payload[1] : null;

				const payload = angular.merge( searchPayload, {
					libraryGames: libraryPayload || [],
				} );

				return new this.searchPayload( options.type, payload );
			} );
	}

	private _searchSite( query: string, options: SearchOptions = { type: 'all' } ): angular.IPromise<any>
	{
		let requestOptions: any = {};

		let endpoint = '/web/search';
		if ( options.type == 'user' ) {
			endpoint += '/users';
		}
		else if ( options.type == 'game' ) {
			endpoint += '/games';
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

		return this.api.sendRequest( endpoint + '?' + searchParams.join( '&' ), null, requestOptions )
			.catch( () =>
			{
				// Catch failures and return an empty success instead.
				return this.$q.resolve( {} );
			} );
	}

	private _searchInstalledGames( query: string ): angular.IPromise<any>
	{
		let games = [];

		for ( const game of this.Client_Library.games ) {
			if ( this.fuzzysearch( query.toLowerCase(), game.title.toLowerCase() ) ) {
				games.push( game );
			}
		}

		if ( games.length > 0 ) {
			games = this.orderByFilter( games, 'title' );
			games = _.take( games, 3 );  // Only return top 3.
		}

		return this.$q.resolve( games );
	}
}
