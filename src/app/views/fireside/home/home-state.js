angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'fireside.home', {
		url: '?page',
		controller: 'Fireside.HomeCtrl',
		controllerAs: 'homeCtrl',
		templateUrl: '/app/views/fireside/home/home.html',
		resolve: {
			payload: function( Api, $stateParams )
			{
				var query = '?';
				if ( $stateParams.page && $stateParams.page > 1 ) {
					query += 'page=' + $stateParams.page;
				}

				return Api.sendRequest( '/fireside' + query );
			}
		}
	} );
} );
