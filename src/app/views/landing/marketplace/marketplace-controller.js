angular.module( 'App.Views' ).controller( 'MarketplaceCtrl', function( App, Meta, Game, Fireside_Post, payload )
{
	var _this = this;

	App.title = 'Sell Your Games';

	Meta.description = payload.metaDescription;
	Meta.fb = payload.fb;
	Meta.twitter = payload.twitter;
	Meta.fb.image = Meta.twitter.image = '/app/views/landing/marketplace/social.png';

	this.firesidePosts = Fireside_Post.populate( payload.firesidePosts );
	this.games = Game.populate( payload.games );
} );
