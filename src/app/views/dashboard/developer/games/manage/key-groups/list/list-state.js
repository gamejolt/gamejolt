angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.key-groups.list', {
		url: '',
		controller: 'Dashboard.Developer.Games.Manage.KeyGroups.ListCtrl',
		controllerAs: 'listCtrl',
		templateUrl: require( './list.html' ),
		resolve: {
			payload: function( $stateParams, Api )
			{
				return Api.sendRequest( '/web/dash/developer/games/key-groups/' + $stateParams.id );
			},
		}
	} );
} );
