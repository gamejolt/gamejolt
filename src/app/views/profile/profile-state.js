angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'profile', {
		abstract: true,
		url: '/@:username',
		controller: 'ProfileCtrl',
		controllerAs: 'profileCtrl',
		templateUrl: require( './profile.html' ),
		resolve: {
			init: function( Translate )
			{
				return Translate.loadSection( 'main' );
			},
			profilePayload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/profile/@' + $stateParams.username );
			}
		}
	} );
} );
