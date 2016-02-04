angular.module( 'App.Views' ).controller( 'Discover.HomeCtrl', function( $scope, $window, App, Environment, Meta, Game, FeaturedItem, Fireside_Post, Game_NewsArticle, SplitTest, payload )
{
	App.title = null;

	Meta.description = payload.metaDescription;
	Meta.fb = payload.fb;
	Meta.twitter = payload.twitter;
	Meta.fb.image = Meta.twitter.image = '/app/img/social/social-share-header.png';
	Meta.fb.url = Meta.twitter.url = Environment.baseUrl;

	this.featuredItems = FeaturedItem.populate( payload.featuredGames );

	this.weeksGames = Game.populate( payload.weeksGames );
	this.hotGames = Game.populate( payload.hotGames );
	this.bestGames = Game.populate( payload.bestGames );

	this.hotArticles = Game_NewsArticle.populate( payload.hotArticles );
	this.followedArticles = payload.followedArticles ? Game_NewsArticle.populate( payload.followedArticles ) : null;

	this.firesidePosts = Fireside_Post.populate( payload.firesidePosts );

	this.articles = {
		hot: this.hotArticles,
		followed: this.followedArticles,
	};

	var weekDateStart = $window.moment().subtract( 7, 'days' ).startOf( 'day' ).format( 'YYYY-MM-DD' );
	var weekDateEnd = $window.moment().add( 1, 'days' ).startOf( 'day' ).format( 'YYYY-MM-DD' );
	this.weekDateRange = weekDateStart + ':' + weekDateEnd;

	this.activeNewsTab = 'hot';

	this.changeNewsTab = function( tab )
	{
		this.activeNewsTab = tab;
	};


	this.hasBetterHot = SplitTest.hasBetterHot( payload );
} );
