angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'landing.game-api-doc', {
		url: '/game-api/doc*path',
		controller: 'Landing.GameApiDocCtrl',
		controllerAs: '$ctrl',
		templateUrl: require( './game-api-doc.html' ),
		resolve: {
			path: function( $stateParams, $http, $state )
			{
				// First check the path as is, then check with "index".
				var path = $stateParams['path'];
				return $http.head( '/doc-game-api' + path + '.html' )
					.then( function() { return path; } )
					.catch( function()
					{
						path += '/index';
						return $http.head( '/doc-game-api' + path + '.html' )
							.then( function() { return path; } )
							.catch( function() { $state.go( 'error-404' ); } );
					} );
			},
			nav: function( $http )
			{
				return $http.get( '/doc-game-api/nav.json' )
					.then( function( response )
					{
						return response.data;
					} );
			},
		}
	} );
} );
