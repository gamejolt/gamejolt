import { Injectable, Inject } from 'ng-metadata/core';
import { GameListingContainer } from '../../../../components/game/listing/listing-container-service';

@Injectable()
export class GamesCtrl
{
	listing: GameListingContainer;

	constructor(
		@Inject( 'filteringContainer' ) public filteringContainer: any,
	)
	{
		this.listing = new GameListingContainer( filteringContainer );
	}
}
