import { Component, Inject, Input, OnInit } from 'ng-metadata/core';
import { StateService } from 'angular-ui-router';
import * as template from '!html-loader!./home.component.html';

import { App } from '../../../app-service';
import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { FiresidePost } from '../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';

interface DiscoverSection {
	title: string;
	url: string;
	eventLabel: string;
	items: any[];
};

@Component({
	selector: 'route-discover-home',
	template,
})
export class RouteHomeComponent implements OnInit
{
	@Input() payload: any;

	featuredItems: any[];

	featuredGames: any[];
	hotGames: any[];
	paidGames: any[];
	bestGames: any[];
	recommendedGames: any[];
	hotDevlogs: any[];

	channels: any[];

	firesidePosts: any[];

	isDevlogsExpanded = false;

	discoverSections: DiscoverSection[];
	chosenSection: DiscoverSection;

	constructor(
		@Inject( '$state' ) private $state: StateService,
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'App' ) public app: App,
		@Inject( 'FeaturedItem' ) private featuredItemModel: any,
	)
	{
	}

	ngOnInit()
	{
		Meta.title = null;

		Meta.description = this.payload.metaDescription;
		Meta.fb = this.payload.fb;
		Meta.twitter = this.payload.twitter;
		Meta.fb.image = Meta.twitter.image = require( '../../../img/social/social-share-header.png' );
		Meta.fb.url = Meta.twitter.url = Environment.baseUrl;

		Meta.microdata = {
			'@context': 'http://schema.org',
			'@type': 'WebSite',
			'url': 'http://gamejolt.com/',
			'name': 'Game Jolt',
			'potentialAction': {
				'@type': 'SearchAction',
				'target': 'http://gamejolt.com/search?q={search_term_string}',
				'query-input': 'required name=search_term_string'
			},
		};

		this.featuredItems = this.featuredItemModel.populate( this.payload.featuredGames );
		this.featuredGames = this.featuredItems.map( ( item ) => item.game );

		this.hotGames = Game.populate( this.payload.hotGames );
		this.paidGames = Game.populate( this.payload.paidGames );
		this.bestGames = Game.populate( this.payload.bestGames );
		this.recommendedGames = Game.populate( this.payload.recommendedGames );
		this.hotDevlogs = Game.populate( this.payload.hotDevlogs );

		this.channels = this.payload.channels;

		this.firesidePosts = FiresidePost.populate( this.payload.firesidePosts );

		const bestSection = {
			title: this.gettextCatalog.getString( 'Best Games' ),
			url: this.$state.href( 'discover.games.list._fetch', { section: 'best' } ),
			eventLabel: 'best-games',
			items: this.bestGames,
		};

		const hotSection = {
			title: this.gettextCatalog.getString( 'Hot Games' ),
			url: this.$state.href( 'discover.games.list._fetch', { section: 'hot' } ),
			eventLabel: 'hot-games',
			items: this.hotGames,
		};

		if ( this.app.user ) {
			const recommendedSection = {
				title: this.gettextCatalog.getString( 'Recommended Games' ),
				url: this.$state.href( 'library.collection.recommended', { id: this.app.user.username } ),
				eventLabel: 'recommended-games',
				items: this.recommendedGames,
			};

			this.discoverSections = [ hotSection, recommendedSection, bestSection ];
		}
		else {
			this.discoverSections = [ bestSection, hotSection ];
		}

		this.chosenSection = this.discoverSections[0];
	}

	changeSection( sectionIndex: number )
	{
		this.chosenSection = this.discoverSections[ sectionIndex ];
	}
}
