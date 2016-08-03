import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../../app-service';
import { Channels } from './../../../components/channel/channels-service';

@Injectable()
export class HomeCtrl
{
	featuredItems: any;

	hotGames: any[];
	paidGames: any[];
	bestGames: any[];

	channels: any[];

	firesidePosts: any[];

	isDevlogsExpanded = false;

	constructor(
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( 'App' ) app: App,
		@Inject( 'Environment' ) Environment: any,
		@Inject( 'Meta' ) Meta: any,
		@Inject( 'Game' ) Game: any,
		@Inject( 'FeaturedItem' ) FeaturedItem: any,
		@Inject( 'Fireside_Post' ) Fireside_Post: any,
		@Inject( 'Channels' ) channels: Channels,
		@Inject( 'payload' ) payload: any
	)
	{
		app.title = null;

		$scope['Channels'] = channels;

		Meta.description = payload.metaDescription;
		Meta.fb = payload.fb;
		Meta.twitter = payload.twitter;
		Meta.fb.image = Meta.twitter.image = '/app/img/social/social-share-header.png';
		Meta.fb.url = Meta.twitter.url = Environment.baseUrl;

		this.featuredItems = FeaturedItem.populate( payload.featuredGames );

		this.hotGames = Game.populate( payload.hotGames );
		this.paidGames = Game.populate( payload.paidGames );
		this.bestGames = Game.populate( payload.bestGames );

		this.channels = payload.channels;

		this.firesidePosts = Fireside_Post.populate( payload.firesidePosts );
	}
}
