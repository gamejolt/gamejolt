angular.module( 'App.Views' ).controller( 'MarketplaceCtrl', function( App, Game, Fireside_Post, payload )
{
	var _this = this;

	App.title = 'Selling Games on Game Jolt';

	this.firesidePosts = Fireside_Post.populate( payload.firesidePosts );
	this.games = Game.populate( payload.games );
} );
