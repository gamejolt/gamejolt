import { Injectable, Inject } from 'ng-metadata/core';
import { Channels } from './../../../../components/channel/channels-service';

@Injectable()
export class ChannelCtrl
{
	channel: any;
	totalGamesCount = 0;
	shouldShowAds = false;

	constructor(
		@Inject( '$scope' ) $scope: any,
		@Inject( 'Meta' ) meta: any,
		channels: Channels,
		@Inject( 'payload' ) payload: any
	)
	{
		$scope.Meta = meta;
		$scope.Channels = channels;

		this.channel = payload.channel;
		this.totalGamesCount = payload.totalGamesCount;
		this.shouldShowAds = payload.shouldShowAds || false;
	}
}
