angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.packages', {
		url: '/packages',
		controller: 'Dashboard.Developer.Games.Manage.PackagesCtrl',
		controllerAs: 'packagesCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/packages/packages.html',
		resolve: {
			packagesPayload: function( $stateParams, Api )
			{
				return Api.sendRequest( '/web/dash/developer/games/packages/' + $stateParams.id );
			}
		}
	} );
} );
