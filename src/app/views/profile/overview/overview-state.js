angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'profile.overview', {
		url: '',
		controller: 'Profile.OverviewCtrl',
		controllerAs: 'overviewCtrl',
		templateUrl: '/app/views/profile/overview/overview.html',
		resolve: {
			payload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/profile/overview/@' + $stateParams.username );
			}
		}
	} );
} );
