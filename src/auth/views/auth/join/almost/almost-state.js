angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'auth.join.almost', {
		url: '/almost',
		views: {
			'@auth': {
				templateUrl: require( './almost.html' ),
				controllerAs: 'almostCtrl',
				controller: 'Auth.Join.AlmostCtrl',
			}
		},
		onEnter: function( App )
		{
			App.shouldShowCoverImage = false;
		},
		onExit: function( App )
		{
			App.shouldShowCoverImage = true;
		}
	} );
} );
