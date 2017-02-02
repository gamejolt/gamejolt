import { Component, OnInit, Input } from 'ng-metadata/core';
import * as template from '!html-loader!./devlogs.component.html';

import { GameListingContainer } from '../../../../../components/game/listing/listing-container-service';

@Component({
	selector: 'route-discover-channels-channel-devlogs',
	template,
})
export class RouteDevlogsComponent implements OnInit
{
	@Input() filteringContainer: any;

	@Input() shouldShowAds: boolean;

	listing: GameListingContainer;

	ngOnInit()
	{
		this.listing = new GameListingContainer( this.filteringContainer );
	}
}
