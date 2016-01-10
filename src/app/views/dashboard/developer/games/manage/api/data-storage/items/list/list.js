angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.api.data-storage.items.list', {
		url: '/items',
		controller: 'Dashboard.Developer.Games.Manage.Api.DataStorage.Items.ListCtrl',
		controllerAs: 'listCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/api/data-storage/items/list/list.html',
		resolve: {
			payload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/dash/developer/games/api/data-storage/' + $stateParams.id );
			}
		}
	} );
} );
