angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'forums.landing.active', {
		url: '/forums/active',
		controller: 'Forums.Landing.ActiveCtrl',
		controllerAs: 'activeCtrl',
		templateUrl: '/app/views/forums/landing/active/active.html',
		resolve: {
			payload: function( Api )
			{
				return Api.sendRequest( '/web/forums/active-topics' );
			},
		},
	} );
} );
