import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../../../app-service';
import { Fireside_Post } from './../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { ActivityFeedContainer } from './../../../../components/activity/feed/feed-container-service';
import { ActivityFeedService } from './../../../../components/activity/feed/feed-service';

@Injectable()
export class OverviewCtrl
{
	games: any[];
	posts: ActivityFeedContainer;

	constructor(
		@Inject( '$stateParams' ) $stateParams: angular.ui.IStateParamsService,
		@Inject( 'App' ) app: App,
		@Inject( 'Game' ) game: any,
		@Inject( 'Fireside_Post' ) firesidePostModel: typeof Fireside_Post,
		@Inject( 'ActivityFeedService' ) feedService: ActivityFeedService,
		@Inject( 'payload' ) payload: any
	)
	{
		this.games = game.populate( payload.games );
		this.posts = feedService.bootstrap( firesidePostModel.populate( payload.posts ) );
	}
}
