angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'profile.videos', {
		url: '/videos',
		controller: 'Profile.VideosCtrl',
		controllerAs: 'videosCtrl',
		templateUrl: require( './videos.html' ),
		resolve: {
			payload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/profile/videos/@' + $stateParams.username );
			}
		}
	} );
} );
