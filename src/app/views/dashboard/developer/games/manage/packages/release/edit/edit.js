angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.packages.release.edit', {
		url: '/edit',
		templateUrl: '/app/views/dashboard/developer/games/manage/packages/release/edit/edit.html',
		controller: 'Dashboard.Developer.Games.Manage.Packages.Release.EditCtrl',
		controllerAs: 'editCtrl',
	} );
} );
