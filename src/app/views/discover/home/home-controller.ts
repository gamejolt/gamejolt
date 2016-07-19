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

	hotArticles: any[];
	followedArticles: any[];

	firesidePosts: any[];

	articles: {
		hot: any[];
		followed: any[],
	};

	activeNewsTab = 'hot';

	constructor(
		@Inject( '$scope' ) $scope: angular.IScope,
		@Inject( '$window' ) $window: angular.IWindowService,
		@Inject( 'App' ) App: App,
		@Inject( 'Environment' ) Environment: any,
		@Inject( 'Meta' ) Meta: any,
		@Inject( 'Game' ) Game: any,
		@Inject( 'FeaturedItem' ) FeaturedItem: any,
		@Inject( 'Fireside_Post' ) Fireside_Post: any,
		@Inject( 'Game_NewsArticle' ) Game_NewsArticle: any,
		@Inject( 'SplitTest' ) SplitTest: any,
		@Inject( 'Channels' ) channels: Channels,
		@Inject( 'payload' ) payload: any
	)
	{
		App.title = null;

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

		this.hotArticles = Game_NewsArticle.populate( payload.hotArticles );
		this.followedArticles = payload.followedArticles ? Game_NewsArticle.populate( payload.followedArticles ) : [];

		this.firesidePosts = Fireside_Post.populate( payload.firesidePosts );

		this.articles = {
			hot: this.hotArticles,
			followed: this.followedArticles,
		};
	}

	changeNewsTab( tab: string )
	{
		this.activeNewsTab = tab;
	}
}
// angular.module( 'App.Views' ).controller( 'Discover.HomeCtrl',  );
