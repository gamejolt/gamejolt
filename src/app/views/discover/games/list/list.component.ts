import { Component, Inject, Input, OnInit } from 'ng-metadata/core';
import * as template from '!html-loader!./list.component.html';

import { GameListingContainer } from '../../../../components/game/listing/listing-container-service';

@Component({
	selector: 'route-discover-games-list',
	template,
})
export class RouteListComponent implements OnInit
{
	@Input() filteringContainer: any;

	pageTitle: string;
	listing: GameListingContainer;
	section: string;
	category?: string;
	descriptiveCategory?: string;

	dateRange?: [ string, string ];
	date?: string;

	badgeImage?: string;

	constructor(
		@Inject( 'gettext' ) gettext: ng.gettext.gettextFunction,
	)
	{
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

	ngOnInit()
	{
		this.listing = new GameListingContainer( this.filteringContainer );
	}
}
