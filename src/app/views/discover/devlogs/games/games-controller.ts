import { Injectable, Inject } from 'ng-metadata/core';
import { GameListingContainer } from '../../../../components/game/listing/listing-container-service';
import { Meta } from '../../../../../lib/gj-lib-client/components/meta/meta-service';

@Injectable()
export class GamesCtrl
{
	listing: GameListingContainer;

	constructor(
		@Inject( 'Meta' ) meta: Meta,
		@Inject( 'filteringContainer' ) public filteringContainer: any,
	)
	{
		meta.title = 'Browse indie game devlogs';
		meta.description = 'Find the latest and greatest games in development and follow their devlog feeds!';

		meta.fb.title = meta.title;
		meta.twitter.title = meta.title;

		meta.fb.description = meta.description;
		meta.twitter.description = meta.description;

		meta.twitter.image = require( '../social.png' );

		this.listing = new GameListingContainer( filteringContainer );
	}
}
