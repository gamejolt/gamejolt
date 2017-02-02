import { Component, OnInit, Inject, Input } from 'ng-metadata/core';
import * as template from '!html-loader!./list.component.html';

import { Channels } from '../../../../components/channel/channels-service';

@Component({
	selector: 'route-discover-channels-list',
	template,
})
export class RouteListComponent implements OnInit
{
	@Input() payload: any;

	channels: any[];
	gameCounts: any = {};

	constructor(
		@Inject( 'Meta' ) private meta: any,
		@Inject( 'Channels' ) public channelsService: Channels,
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog,
	)
	{
	}

	ngOnInit()
	{
		this.meta.title = this.gettextCatalog.getString( 'Top Channels' );
		this.meta.description = 'Find and discover indie games around specific interests.';

		this.channels = this.payload.channels;
		this.payload.gameCounts.forEach( ( item: any ) =>
			this.gameCounts[ item.channel ] = item.count
		);
	}
}
