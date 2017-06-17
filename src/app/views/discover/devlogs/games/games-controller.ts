import { Injectable, Inject } from 'ng-metadata/core';
import { GameListingContainer } from '../../../../components/game/listing/listing-container-service';
import { Meta } from '../../../../../lib/gj-lib-client/components/meta/meta-service';

@Injectable()
export class GamesCtrl {
	listing: GameListingContainer;

	constructor(@Inject('filteringContainer') public filteringContainer: any) {
		Meta.title = 'Browse indie game devlogs';
		Meta.description =
			'Find the latest and greatest games in development and follow their devlog feeds!';

		Meta.fb.title = Meta.title;
		Meta.twitter.title = Meta.title;

		Meta.fb.description = Meta.description;
		Meta.twitter.description = Meta.description;

		Meta.twitter.image = require('../social.png');

		this.listing = new GameListingContainer(filteringContainer);
	}
}
