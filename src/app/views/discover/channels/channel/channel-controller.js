angular.module( 'App.Views' ).controller( 'Discover.Channels.ChannelCtrl', function( $stateParams, Game, payload )
{
	this.channel = payload.channel;
	this.totalGamesCount = payload.totalGamesCount;
	this.shouldShowAds = payload.shouldShowAds || false;
} );
