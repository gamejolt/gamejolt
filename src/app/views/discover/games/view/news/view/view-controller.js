angular.module( 'App.Views' ).controller( 'Discover.Games.View.News.ViewCtrl', function( $scope, $stateParams, Location, App, Meta, Game_NewsArticle, payload )
{
	this.article = new Game_NewsArticle( payload.article );

	Location.enforce( {
		slug: $scope.gameCtrl.game.slug,
		articleSlug: this.article.slug,
	} );

	this.latestArticles = Game_NewsArticle.populate( payload.latestArticles );

	this.currentCommentPage = $stateParams.comment_page;

	// If there is a notification on this article, mark it as read.
	if ( this.article.notification ) {
		this.article.notification.$read();
	}

	App.title = this.article.title + ' - ' + $scope.gameCtrl.game.title;
	Meta.description = payload.metaDescription;
	Meta.fb = payload.fb;
	Meta.twitter = payload.twitter;
} );
