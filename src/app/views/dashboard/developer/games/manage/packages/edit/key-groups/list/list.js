angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.packages.edit.keygroups.list', {
		url: '/{sellableId:int}',
		controller: 'Dashboard.Developer.Games.Manage.Packages.Edit.KeyGroups.ListCtrl',
		controllerAs: 'listKeyGroupsCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/packages/edit/key-groups/list/list.html',
		resolve: {
			keyGroupsPayload: function( $stateParams, Api )
			{
				return Api.sendRequest( '/web/dash/developer/sellables/key-groups/' + $stateParams.sellableId );
			},
			checkRedirect: function( $state, $stateParams, keyGroupsPayload )
			{
				//console.log( keyGroupsPayload );
				//if ( !packagesPayload.packages.length ) {
				//	$state.go( 'dashboard.developer.games.manage.packages.add', $stateParams );
				//}
			},
		}
	} );
} );
