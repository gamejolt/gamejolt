import { Component, OnInit, Input } from 'ng-metadata/core';
import * as template from '!html-loader!./games.component.html';

import { GameListingContainer } from '../../../../../components/game/listing/listing-container-service';

@Component({
	selector: 'route-discover-channels-channel-games',
	template,
})
export class RouteGamesComponent implements OnInit
{
	@Input() public filteringContainer: any;

	@Input() shouldShowAds: boolean;

	listing: GameListingContainer;

	ngOnInit()
	{
		this.listing = new GameListingContainer( this.filteringContainer );
	}
}
