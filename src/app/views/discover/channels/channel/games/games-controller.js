angular.module( 'App.Views' ).controller( 'Discover.Channels.Channel.GamesCtrl', function( Channels_ViewHelper, filteringContainer )
{
	this.filteringContainer = filteringContainer;

	this.gamesCount = 0;
	this.perPage = 10;
	this.currentPage = 1;
	this.section = 'hot';

	this.processPayload = function( $stateParams, payload )
	{
		this.gamesCount = payload.gamesCount;
		this.perPage = payload.perPage;
		this.currentPage = $stateParams.page || 1;
		this.section = $stateParams.section;

		Channels_ViewHelper.setDefaultMetaData( $stateParams.channel );
	};
} );
