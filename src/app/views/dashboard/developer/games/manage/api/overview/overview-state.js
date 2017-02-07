angular.module( 'App.Views' ).config( function( $stateProvider, $urlRouterProvider )
{
	$urlRouterProvider.when( '/dashboard/developer/games/achievements/:id', '/dashboard/games/:id/api' );

	$stateProvider.state( 'dashboard.developer.games.manage.api.overview', {
		url: '',
		controller: 'Dashboard.Developer.Games.Manage.Api.OverviewCtrl',
		controllerAs: 'overviewCtrl',
		templateUrl: require( './overview.html' ),
		resolve: {
			payload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/dash/developer/games/api/' + $stateParams.id );
			}
		}
	} );
} );
