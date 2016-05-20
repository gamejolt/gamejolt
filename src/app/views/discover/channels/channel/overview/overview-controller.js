angular.module( 'App.Views' ).controller( 'Discover.Channels.Channel.OverviewCtrl', function( Game, payload )
{
	this.bestGames = Game.populate( payload.bestGames );
	this.hotGames = Game.populate( payload.hotGames );
} );
