angular.module( 'App.Search' ).service( 'Search_History', function( $window )
{
	var STORAGE_KEY = 'search-history';

	this.get = function()
	{
		var searchHistory = [];
		if ( $window.localStorage[ STORAGE_KEY ] ) {
			try {
				searchHistory = JSON.parse( $window.localStorage[ STORAGE_KEY ] );

				if ( !Array.isArray( searchHistory ) ) {
					throw new Error( 'Search history is not array.' );
				}
			}
			catch ( e ) {
				searchHistory = [];
			}
		}

		return searchHistory;
	};

	this.record = function( query )
	{
		var searchHistory = this.get();

		query = query.trim();
		if ( !query ) {
			return;
		}

		searchHistory.unshift( query );
		searchHistory = _.uniq( searchHistory );

		// Only keep the last 7.
		searchHistory = searchHistory.slice( 0, 7 );

		$window.localStorage[ STORAGE_KEY ] = JSON.stringify( searchHistory );
	};

	this.clear = function()
	{
		$window.localStorage.removeItem( STORAGE_KEY );
	};
} );
