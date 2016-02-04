angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Game.MaturityCtrl', function( $scope, App, Scroll, Growls, gettextCatalog )
{
	App.title = gettextCatalog.getString( 'dash.games.maturity.page_title', { game: $scope.manageCtrl.game.title } );

	this.onSaved = function()
	{
		Growls.success(
			gettextCatalog.getString( 'dash.games.maturity.saved_growl' ),
			gettextCatalog.getString( 'dash.games.maturity.saved_growl_title' )
		);
		Scroll.to( 0 );
	};
} );
