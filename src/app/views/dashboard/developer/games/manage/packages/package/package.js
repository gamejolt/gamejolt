angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.packages.package', {
		abstract: true,
		url: '/{packageId:int}',
		controller: 'Dashboard.Developer.Games.Manage.Packages.PackageCtrl',
		controllerAs: 'packageCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/packages/package/package.html',
		resolve: {
			packagePayload: function( $stateParams, Api )
			{
				return Api.sendRequest( '/web/dash/developer/games/packages/' + $stateParams.id + '/' + $stateParams.packageId );
			}
		}
	} );
} );
