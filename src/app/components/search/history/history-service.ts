import { Injectable, Inject } from 'ng-metadata/core';

const STORAGE_KEY = 'search-history';

@Injectable( 'SearchHistory' )
export class SearchHistory
{
	constructor(
		@Inject( '$window' ) private $window: ng.IWindowService
	)
	{
	}

	get()
	{
		let searchHistory: string[] = [];
		if ( this.$window.localStorage[ STORAGE_KEY ] ) {
			try {
				searchHistory = JSON.parse( this.$window.localStorage[ STORAGE_KEY ] );

				if ( !Array.isArray( searchHistory ) ) {
					throw new Error( 'Search history is not array.' );
				}
			}
			catch ( e ) {
				searchHistory = [];
			}
		}

		return searchHistory;
	}

	record( query: string )
	{
		let searchHistory = this.get();

		query = query.trim();
		if ( !query ) {
			return;
		}

		searchHistory.unshift( query );
		searchHistory = _.uniq( searchHistory );

		// Only keep the last 7.
		searchHistory = searchHistory.slice( 0, 7 );

		this.$window.localStorage[ STORAGE_KEY ] = JSON.stringify( searchHistory );
	}

	clear()
	{
		this.$window.localStorage.removeItem( STORAGE_KEY );
	}
}
