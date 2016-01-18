angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.News.AddCtrl', function( $state, App, Growls, gettextCatalog )
{
	App.title = gettextCatalog.getString( 'dash.games.news.add.page_title' );

	this.onSubmitted = function()
	{
		Growls.success(
			gettextCatalog.getString( 'dash.games.news.add.added_growl' ),
			gettextCatalog.getString( 'dash.games.news.add.added_growl_title' )
		);
		$state.go( '^.list' );
	};
} );
