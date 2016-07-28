import { Injectable, Inject } from 'ng-metadata/core';
import { GameListingContainer } from './../../../../components/game/listing/listing-container-service';

@Injectable()
export class GamesCtrl
{
	listing: GameListingContainer;

	constructor(
		@Inject( 'filteringContainer' ) public filteringContainer: any,
		@Inject( 'GameListingContainer' ) listingContainer: typeof GameListingContainer,
	)
	{
		this.listing = new listingContainer( filteringContainer );
	}
}
