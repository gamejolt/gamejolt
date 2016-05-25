angular.module( 'App.Views' ).controller( 'Discover.Channels.ChannelCtrl', function( $scope, Meta, Channels, payload )
{
	$scope.Meta = Meta;
	$scope.Channels = Channels;

	this.channel = payload.channel;
	this.totalGamesCount = payload.totalGamesCount;
	this.shouldShowAds = payload.shouldShowAds || false;
} );
