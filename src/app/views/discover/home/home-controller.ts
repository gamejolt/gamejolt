import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../../app-service';
import { Channels } from './../../../components/channel/channels-service';
import { Meta } from './../../../../lib/gj-lib-client/components/meta/meta-service';

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

	constructor(
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( 'App' ) app: App,
		@Inject( 'Environment' ) Environment: any,
		@Inject( 'Meta' ) meta: Meta,
		@Inject( 'Game' ) Game: any,
		@Inject( 'FeaturedItem' ) FeaturedItem: any,
		@Inject( 'Fireside_Post' ) Fireside_Post: any,
		@Inject( 'Channels' ) channels: Channels,
		@Inject( 'payload' ) payload: any
	)
	{
		app.title = null;

		$scope['Channels'] = channels;

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

		this.featuredItems = FeaturedItem.populate( payload.featuredGames );

		this.hotGames = Game.populate( payload.hotGames );
		this.paidGames = Game.populate( payload.paidGames );
		this.bestGames = Game.populate( payload.bestGames );
		this.recommendedGames = Game.populate( payload.recommendedGames );
		this.hotDevlogs = Game.populate( payload.hotDevlogs );

		this.channels = payload.channels;

		this.firesidePosts = Fireside_Post.populate( payload.firesidePosts );
	}
}
