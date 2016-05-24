angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.packages.edit.keygroups.add', {
		url: '/{sellableId:int}/add',
		controller: 'Dashboard.Developer.Games.Manage.Packages.Edit.KeyGroups.AddCtrl',
		controllerAs: 'addKeyGroupsCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/packages/edit/key-groups/add/add.html'
	} );
} );
