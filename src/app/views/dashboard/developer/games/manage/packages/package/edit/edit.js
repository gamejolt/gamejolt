angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.packages.package.edit', {
		url: '/edit',
		controller: 'Dashboard.Developer.Games.Manage.Packages.Package.EditCtrl',
		controllerAs: 'editCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/packages/package/edit/edit.html',
	} );
} );
