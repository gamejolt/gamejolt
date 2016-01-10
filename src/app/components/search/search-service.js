angular.module( 'App.Search' ).service( 'Search', function( $injector, $q, Environment, Api, Fuzzysearch, SearchPayload, orderByFilter )
{
	var Client_Library = Environment.isClient ? $injector.get( 'Client_Library' ) : null;

	this.query = '';

	this.globalQuery = function( query )
	{
		if ( angular.isUndefined( query ) ) {
			return this.query;
		}

		this.query = query;
	};

	this.search = function( query, options )
	{
		options = options || {};

		var searchPromises = [];
		searchPromises.push( this.searchSite( query, options ) );

		// If we're in client, let's try to search their installed games.
		if ( Client_Library && options.type && options.type == 'typeahead' ) {
			searchPromises.push( this.searchInstalledGames( query ) );
		}

		return $q.all( searchPromises )
			.then( function( _payload )
			{
				var searchPayload = _payload[0];
				var libraryPayload = _payload.length == 2 ? _payload[1] : null;

				var payload = angular.merge( searchPayload, {
					libraryGames: libraryPayload || [],
				} );

				return new SearchPayload( options.type || 'all', payload );
			} );
	};

	this.searchSite = function( query, options )
	{
		var requestOptions = {};

		var endpoint = '/web/search';
		if ( options.type && options.type == 'user' ) {
			endpoint += '/users';
		}
		else if ( options.type && options.type == 'game' ) {
			endpoint += '/games';
		}
		else if ( options.type && options.type == 'typeahead' ) {
			endpoint += '/typeahead';
			requestOptions.detach = true;
		}

		var searchParams = [
			'q=' + (query || ''),
		];

		if ( options.page && options.page > 1 ) {
			searchParams.push( 'page=' + options.page );
		}

		return Api.sendRequest( endpoint + '?' + searchParams.join( '&' ), null, requestOptions )
			.catch( function()
			{
				// Catch failures and return an empty success instead.
				return $q.resolve( {} );
			} );
	};

	this.searchInstalledGames = function( query )
	{
		var games = [];

		for ( var i in Client_Library.games ) {
			if ( Fuzzysearch( query.toLowerCase(), Client_Library.games[ i ].title.toLowerCase() ) ) {
				games.push( Client_Library.games[ i ] );
			}
		}

		if ( games.length ) {
			games = orderByFilter( games, 'title' );
			games = _.take( games, 3 );  // Only return top 3.
		}

		return games;
	};
} );
