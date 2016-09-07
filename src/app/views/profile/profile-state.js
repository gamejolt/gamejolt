angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'profile', {
		abstract: true,
		url: '/profile/:slug/:id',
		controller: 'ProfileCtrl',
		controllerAs: 'profileCtrl',
		templateUrl: '/app/views/profile/profile.html',
		resolve: {
			init: function( Translate )
			{
				return Translate.loadSection( 'main' );
			},
			profilePayload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/profile/' + $stateParams.id );
			}
		}
	} );
} );
