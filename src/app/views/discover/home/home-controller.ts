import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../../app-service';
import { Meta } from './../../../../lib/gj-lib-client/components/meta/meta-service';
import { Fireside_Post } from './../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { SplitTest } from '../../../components/split-test/split-test-service';

@Injectable()
export class HomeCtrl
{
	featuredItems: any;

	hotGames: any[];
	paidGames: any[];
	bestGames: any[];
	recommendedGames: any[];
	hotDevlogs: any[];

	channels: any[];

	firesidePosts: any[];

	isDevlogsExpanded = false;

	hasNoFeaturedSplit = false;

	constructor(
		@Inject( 'App' ) app: App,
		@Inject( 'Environment' ) Environment: any,
		@Inject( 'Meta' ) meta: Meta,
		@Inject( 'Game' ) gameModel: any,
		@Inject( 'FeaturedItem' ) featuredItemModel: any,
		@Inject( 'Fireside_Post' ) firesidePostModel: typeof Fireside_Post,
		@Inject( 'SplitTest' ) splitTest: SplitTest,
		@Inject( 'payload' ) payload: any,
	)
	{
		this.hasNoFeaturedSplit = splitTest.hasHomeNoFeatured( payload );

		app.title = null;

		meta.description = payload.metaDescription;
		meta.fb = payload.fb;
		meta.twitter = payload.twitter;
		meta.fb.image = meta.twitter.image = '/app/img/social/social-share-header.png';
		meta.fb.url = meta.twitter.url = Environment.baseUrl;

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

		this.hotGames = gameModel.populate( payload.hotGames );
		this.paidGames = gameModel.populate( payload.paidGames );
		this.bestGames = gameModel.populate( payload.bestGames );
		this.recommendedGames = gameModel.populate( payload.recommendedGames );
		this.hotDevlogs = gameModel.populate( payload.hotDevlogs );

		this.channels = payload.channels;

		this.firesidePosts = firesidePostModel.populate( payload.firesidePosts );
	}
}
