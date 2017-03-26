import { arrayUnique } from '../../../../lib/gj-lib-client/utils/array';

const STORAGE_KEY = 'search-history';

export class SearchHistory
{
	static get()
	{
		let searchHistory: string[] = [];
		if ( window.localStorage[ STORAGE_KEY ] ) {
			try {
				searchHistory = JSON.parse( window.localStorage[ STORAGE_KEY ] );

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

	static record( query: string )
	{
		let searchHistory = this.get();

		query = query.trim();
		if ( !query ) {
			return;
		}

		searchHistory.unshift( query );
		searchHistory = arrayUnique( searchHistory );

		// Only keep the last 7.
		searchHistory = searchHistory.slice( 0, 7 );

		window.localStorage[ STORAGE_KEY ] = JSON.stringify( searchHistory );
	}

	static clear()
	{
		window.localStorage.removeItem( STORAGE_KEY );
	}
}
