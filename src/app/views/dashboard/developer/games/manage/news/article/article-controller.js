angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.News.ArticleCtrl', function( $state, ModalConfirm, Growls, gettextCatalog )
{
	var _this = this;

	this.article = null;

	this.remove = function()
	{
		if ( !this.article ) {
			throw new Error( 'No article loaded.' );
		}

		ModalConfirm.show( gettextCatalog.getString( 'dash.games.news.article.remove_confirmation' ) )
			.then( function()
			{
				return _this.article.$remove();
			} )
			.then( function()
			{
				Growls.success(
					gettextCatalog.getString( 'dash.games.news.article.remove_growl' ),
					gettextCatalog.getString( 'dash.games.news.article.remove_growl_title' )
				);
				$state.go( 'dashboard.developer.games.manage.news.list' );
			} );
	};
} );
