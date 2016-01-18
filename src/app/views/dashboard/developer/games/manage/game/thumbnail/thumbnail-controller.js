angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Game.ThumbnailCtrl', function( $scope, App, Scroll, Growls, gettextCatalog )
{
	App.title = gettextCatalog.getString( 'dash.games.thumbnail.page_title', { game: $scope.manageCtrl.game.title } );

	this.onSaved = function()
	{
		Growls.success(
			gettextCatalog.getString( 'dash.games.thumbnail.saved_growl' ),
			gettextCatalog.getString( 'dash.games.thumbnail.saved_growl_title' )
		);
		Scroll.to( 0 );
	};
} );
