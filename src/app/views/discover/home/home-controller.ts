import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../../app-service';
import { Meta } from './../../../../lib/gj-lib-client/components/meta/meta-service';
import { Fireside_Post } from './../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';

interface DiscoverSection {
	title: string;
	url: string;
	eventLabel: string;
	items: any[];
};

@Injectable()
export class HomeCtrl
{
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
		@Inject( '$state' ) $state: ng.ui.IStateService,
		@Inject( 'gettextCatalog' ) gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'App' ) app: App,
		@Inject( 'Environment' ) env: Environment,
		@Inject( 'Meta' ) meta: Meta,
		@Inject( 'Game' ) gameModel: any,
		@Inject( 'FeaturedItem' ) featuredItemModel: any,
		@Inject( 'Fireside_Post' ) firesidePostModel: typeof Fireside_Post,
		@Inject( 'payload' ) payload: any,
	)
	{
		app.title = null;

		meta.description = payload.metaDescription;
		meta.fb = payload.fb;
		meta.twitter = payload.twitter;
		meta.fb.image = meta.twitter.image = '/app/img/social/social-share-header.png';
		meta.fb.url = meta.twitter.url = env.baseUrl;

		meta.microdata = {
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

		this.featuredItems = featuredItemModel.populate( payload.featuredGames );
		this.featuredGames = _.pluck( this.featuredItems, 'game' );

		this.hotGames = gameModel.populate( payload.hotGames );
		this.paidGames = gameModel.populate( payload.paidGames );
		this.bestGames = gameModel.populate( payload.bestGames );
		this.recommendedGames = gameModel.populate( payload.recommendedGames );
		this.hotDevlogs = gameModel.populate( payload.hotDevlogs );

		this.channels = payload.channels;

		this.firesidePosts = firesidePostModel.populate( payload.firesidePosts );

		const bestSection = {
			title: gettextCatalog.getString( 'Best Games' ),
			url: $state.href( 'discover.games.list._fetch', { section: 'best' } ),
			eventLabel: 'best-games',
			items: this.bestGames,
		};

		const hotSection = {
			title: gettextCatalog.getString( 'Hot Games' ),
			url: $state.href( 'discover.games.list._fetch', { section: 'hot' } ),
			eventLabel: 'hot-games',
			items: this.hotGames,
		};

		if ( app.user ) {
			const recommendedSection = {
				title: gettextCatalog.getString( 'Recommended Games' ),
				url: $state.href( 'library.collection.recommended', { id: app.user.username } ),
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
