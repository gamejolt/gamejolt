angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Game.SettingsCtrl', function( $scope, App, Growls, Scroll, gettextCatalog )
{
	App.title = gettextCatalog.getString( 'dash.games.settings.page_title', { game: $scope.manageCtrl.game.title } );

	this.onSaved = function()
	{
		Growls.success(
			gettextCatalog.getString( 'dash.games.settings.save_growl' ),
			gettextCatalog.getString( 'dash.games.settings.save_growl_title' )
		);
		Scroll.to( 0 );
	};
} );
