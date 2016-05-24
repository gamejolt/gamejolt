angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.packages.edit.keygroups.edit', {
		url: '/{sellableId:int}/edit/{keyGroupId:int}',
		controller: 'Dashboard.Developer.Games.Manage.Packages.Edit.KeyGroups.EditCtrl',
		controllerAs: 'editKeyGroupsCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/packages/edit/key-groups/edit/edit.html',
		resolve: {
			keyGroupPayload: function( $stateParams, Api )
			{
				console.log($stateParams);
				return Api.sendRequest( '/web/dash/developer/sellables/key-groups/save/' + $stateParams.sellableId + '/' + $stateParams.keyGroupId );
			},
			//sellableCheck: function( $state, keyGroupPayload )
			//{
			//	if ( !keyGroupPayload.sellable || keyGroupPayload.sellable.type == 'free' ) {
			//		$state.go( 'error-404' );
			//	}
			//},
		}
	} );
} );
