angular.module( 'App.Views' ).controller( 'Discover.Channels.Channel.OverviewCtrl', function( $stateParams, Game, Channels_ViewHelper, payload )
{
	this.bestGames = Game.populate( payload.bestGames );
	this.hotGames = Game.populate( payload.hotGames );

	Channels_ViewHelper.setDefaultMetaData( $stateParams.channel );
} );
