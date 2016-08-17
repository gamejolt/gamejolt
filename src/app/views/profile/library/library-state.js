angular.module( 'App.Views' ).config( function( $stateProvider, $urlRouterProvider )
{
	// /profile/cross/game-library/1/
	$urlRouterProvider.when( '/profile/:slug/game-library/{id:int}', '/profile/:slug/:id/library' );

	$stateProvider.state( 'profile.library', {
		url: '/library',
		controller: 'Profile.LibraryCtrl',
		controllerAs: 'libraryCtrl',
		templateUrl: '/app/views/profile/library/library.html',
		resolve: {
			payload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/library/' + $stateParams.id );
			}
		}
	} );
} );
