import { Component, OnInit, Input } from 'ng-metadata/core';
import * as template from '!html-loader!./_fetch.component.html';

import { GameListingContainer } from '../../../../../components/game/listing/listing-container-service';

@Component({
	selector: 'route-discover-channels-channel-games-fetch',
	template,
})
export class RouteFetchComponent implements OnInit
{
	@Input() payload: any;

	@Input() listing: GameListingContainer;

	ngOnInit()
	{
		this.listing.processPayload( this.payload );
	}
}
