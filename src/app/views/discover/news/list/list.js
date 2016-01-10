angular.module( 'App.Views' ).config( function( $stateProvider )
{
	function getQueryString( $stateParams )
	{
		var query = [];

		var sort = $stateParams.sort || 'hot';
		query.push( 'sort=' + sort );

		var page = $stateParams.page || 1;
		query.push( 'page=' + page );

		if ( $stateParams.tag ) {
			query.push( 'tag=' + $stateParams.tag );
		}

		return query.join( '&' );
	}

	$stateProvider.state( 'discover.news.list', {
		url: '^/news?sort&page',
		controller: 'Discover.News.ListCtrl',
		resolve: {
			payload: function( $stateParams, Api )
			{
				return Api.sendRequest( '/web/discover/news?' + getQueryString( $stateParams ) );
			}
		}
	} );

	$stateProvider.state( 'discover.news.list-section', {
		url: '^/news/:section?sort&page',
		controller: 'Discover.News.ListCtrl',
		resolve: {
			payload: function( $stateParams, Api )
			{
				return Api.sendRequest( '/web/discover/news/' + $stateParams.section + '?' + getQueryString( $stateParams ) );
			}
		}
	} );

	$stateProvider.state( 'discover.news.list-tag', {
		url: '^/news/tag/:tag?sort&page',
		controller: 'Discover.News.ListCtrl',
		resolve: {
			payload: function( $stateParams, Api )
			{
				return Api.sendRequest( '/web/discover/news/tag?' + getQueryString( $stateParams ) );
			}
		}
	} );
} );
