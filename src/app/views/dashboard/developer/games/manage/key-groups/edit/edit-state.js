angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.key-groups.edit', {
		url: '/edit/{keyGroupId:int}',
		controller: 'Dashboard.Developer.Games.Manage.KeyGroups.EditCtrl',
		controllerAs: 'editCtrl',
		templateUrl: require( './edit.html' ),
		resolve: {
			payload: function( $stateParams, Api )
			{
				return Api.sendRequest( '/web/dash/developer/games/key-groups/' + $stateParams.id + '/' + $stateParams.keyGroupId );
			},
		}
	} );
} );
