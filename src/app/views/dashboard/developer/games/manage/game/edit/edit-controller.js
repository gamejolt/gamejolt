angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Game.EditCtrl', function( $scope, App, Growls, Scroll, gettextCatalog )
{
	App.title = gettextCatalog.getString( 'dash.games.edit.page_title', { game: $scope.manageCtrl.game.title } );

	this.onSaved = function( response )
	{
		if ( response.wasPublished ) {
			Growls.success(
				gettextCatalog.getString( 'dash.games.overview.published_growl' ),
				gettextCatalog.getString( 'dash.games.overview.published_growl_title' )
			);
		}
		else {
			Growls.success(
				gettextCatalog.getString( 'dash.games.edit.save_growl' ),
				gettextCatalog.getString( 'dash.games.edit.save_growl_title' )
			);
		}

		Scroll.to( 0 );
	};
} );
