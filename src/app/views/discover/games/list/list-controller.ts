import { Injectable, Inject } from 'ng-metadata/core';
import { GameListingContainer } from './../../../../components/game/listing/listing-container-service';

@Injectable()
export class ListCtrl
{
	pageTitle: string;
	listing: GameListingContainer;
	section: string;
	category?: string;
	descriptiveCategory?: string;

	dateRange?: [ string, string ];
	date?: string;

	badgeImage?: string;

	constructor(
		@Inject( 'filteringContainer' ) public filteringContainer: any,
		@Inject( 'GameListingContainer' ) listingContainer: typeof GameListingContainer,
		@Inject( 'gettext' ) gettext: ng.gettext.gettextFunction,
	)
	{
		this.listing = new listingContainer( filteringContainer );

		// Just pull in the translation labels we need.
		gettext( 'discover.categories.all' );
		gettext( 'discover.categories.arcade' );
		gettext( 'discover.categories.action' );
		gettext( 'discover.categories.adventure' );
		gettext( 'discover.categories.platformer' );
		gettext( 'discover.categories.puzzle' );
		gettext( 'discover.categories.rpg' );
		gettext( 'discover.categories.shooter' );
		gettext( 'discover.categories.sports' );
		gettext( 'discover.categories.strategy_sim' );
		gettext( 'discover.categories.other' );

		gettext( 'games.list.page_title' );
		gettext( 'games.list.page_title_rpg' );
		gettext( 'games.list.page_title_other' );

		gettext( 'games.list.section_featured' );
		gettext( 'games.list.section_new' );
		gettext( 'games.list.section_fresh' );
		gettext( 'games.list.section_hot' );
		gettext( 'games.list.section_best' );
	}
}
