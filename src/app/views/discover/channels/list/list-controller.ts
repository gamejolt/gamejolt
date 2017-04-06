import { Injectable, Inject } from 'ng-metadata/core';
import { Channels } from './../../../../components/channel/channels-service';

@Injectable()
export class ListCtrl
{
	channels: any[];
	gameCounts: any = {};

	constructor(
		@Inject( 'Meta' ) meta: any,
		@Inject( 'Channels' ) public channelsService: Channels,
		@Inject( 'gettextCatalog' ) gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'payload' ) payload: any,
	)
	{
		meta.title = gettextCatalog.getString( 'Top Channels' );
		meta.description = 'Find and discover indie games around specific interests.';

		this.channels = payload.channels;
		angular.forEach( payload.gameCounts, ( item: any ) => this.gameCounts[ item.channel ] = item.count );
	}
}
