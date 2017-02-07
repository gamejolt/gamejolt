import { Component, OnInit, Inject, Input } from 'ng-metadata/core';
import { Transition } from 'angular-ui-router';
import * as template from '!html-loader!./channel.component.html';

import { ChannelsViewHelper } from '../channels-view-helper';
import { Channels } from '../../../../components/channel/channels-service';
import { Meta } from '../../../../../lib/gj-lib-client/components/meta/meta-service';

@Component({
	selector: 'route-discover-channels-channel',
	template,
})
export class RouteChannelComponent implements OnInit
{
	@Input() payload: any;
	@Input() $transition$: Transition;

	channel: any;
	totalGamesCount = 0;
	shouldShowAds = false;

	constructor(
		@Inject( 'Meta' ) public meta: Meta,
		@Inject( 'Channels' ) public channels: Channels,
	)
	{
	}

	ngOnInit()
	{
		this.channel = this.payload.channel;
		this.totalGamesCount = this.payload.totalGamesCount;
		this.shouldShowAds = this.payload.shouldShowAds || false;

		ChannelsViewHelper.setDefaultMetaData( this.$transition$.params().channel );
	}
}
