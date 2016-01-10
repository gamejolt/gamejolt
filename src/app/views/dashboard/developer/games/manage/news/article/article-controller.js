angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.News.ArticleCtrl', function( $state, $translate, ModalConfirm, Translate )
{
	var _this = this;

	this.article = null;

	this.remove = function()
	{
		if ( !this.article ) {
			throw new Error( 'No article loaded.' );
		}

		ModalConfirm.show( $translate.instant( 'dash.games.news.article.remove_confirmation' ) )
			.then( function()
			{
				return _this.article.$remove();
			} )
			.then( function()
			{
				Translate.growl( 'success', 'dash.games.news.article.remove' );
				$state.go( 'dashboard.developer.games.manage.news.list' );
			} );
	};
} );
