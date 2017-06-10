angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dash.games.manage.game.packages.edit', {
		url: '/{packageId:int}',
		controller: 'Dashboard.Developer.Games.Manage.Game.Packages.EditCtrl',
		controllerAs: 'editCtrl',
		templateUrl: require( './edit.html' ),
		resolve: {
			packagePayload: function( $stateParams, Api )
			{
				return Api.sendRequest( '/web/dash/developer/games/packages/' + $stateParams.id + '/' + $stateParams.packageId );
			}
		}
	} );
} );
