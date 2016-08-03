angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.game.packages.edit.widget', {
		url: '/widget',
		controller: 'Dashboard.Developer.Games.Manage.Game.Packages.Edit.WidgetCtrl',
		controllerAs: 'widgetCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/game/packages/edit/widget/widget.html',
		resolve: {
			widgetPayload: function( $stateParams, Api )
			{
				return Api.sendRequest( '/web/dash/developer/games/packages/preview/' + $stateParams.id + '/' + $stateParams.packageId );
			},
			sellableCheck: function( $state, widgetPayload )
			{
				if ( !widgetPayload.sellable || widgetPayload.sellable.type == 'free' ) {
					$state.go( 'error-404' );
				}
			},
		}
	} );
} );
