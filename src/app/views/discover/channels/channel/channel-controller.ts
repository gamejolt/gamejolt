import { Injectable, Inject } from 'ng-metadata/core';
import { Channels_ViewHelper } from '../channels-view-helper';
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
		@Inject( 'Channels' ) channels: Channels,
		@Inject( 'Channels_ViewHelper' ) viewHelper: Channels_ViewHelper,
		@Inject( '$stateParams' ) $stateParams: ng.ui.IStateParamsService,
		@Inject( 'payload' ) payload: any
	)
	{
		$scope.Meta = meta;
		$scope.Channels = channels;

		this.channel = payload.channel;
		this.totalGamesCount = payload.totalGamesCount;
		this.shouldShowAds = payload.shouldShowAds || false;

		viewHelper.setDefaultMetaData( $stateParams['channel'] );
	}
}
