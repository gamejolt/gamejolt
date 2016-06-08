export class ChannelCtrl
{
	channel: any;
	totalGamesCount = 0;
	shouldShowAds = false;

	constructor( $scope, Meta, Channels, payload )
	{
		$scope.Meta = Meta;
		$scope.Channels = Channels;

		this.channel = payload.channel;
		this.totalGamesCount = payload.totalGamesCount;
		this.shouldShowAds = payload.shouldShowAds || false;
	}
}
