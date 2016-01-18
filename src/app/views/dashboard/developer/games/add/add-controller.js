angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.AddCtrl', function( $state, App, gettextCatalog, Growls, Game )
{
	App.title = gettextCatalog.getString( 'dash.games.add.page_title' );

	this.onSubmit = function( formModel )
	{
		Growls.success( {
			message: gettextCatalog.getString( 'dash.games.add.add_growl' ),
			title: gettextCatalog.getString( 'dash.games.add.add_growl_title' ),
			sticky: true,
		} );

		$state.go( 'dashboard.developer.games.manage.game.overview', { id: formModel.id } );
	};
} );
