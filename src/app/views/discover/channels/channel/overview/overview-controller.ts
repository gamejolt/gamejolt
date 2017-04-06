import { Injectable, Inject } from 'ng-metadata/core';
import { ChannelsViewHelper } from './../../channels-view-helper';
import { ActivityFeedService } from './../../../../../components/activity/feed/feed-service';
import { ActivityFeedContainer } from './../../../../../components/activity/feed/feed-container-service';
import { Fireside_Post } from './../../../../../../lib/gj-lib-client/components/fireside/post/post-model';

@Injectable()
export class OverviewCtrl
{
	bestGames: any[];
	hotGames: any[];
	posts: ActivityFeedContainer;

	constructor(
		@Inject( '$stateParams' ) $stateParams: ng.ui.IStateParamsService,
		@Inject( 'Game' ) Game: any,
		@Inject( 'ChannelsViewHelper' ) ChannelsViewHelper: ChannelsViewHelper,
		@Inject( 'ActivityFeedService' ) feedService: ActivityFeedService,
		@Inject( 'Fireside_Post' ) firesidePostModel: typeof Fireside_Post,
		@Inject( 'payload' ) payload: any
	)
	{
		this.bestGames = Game.populate( payload.bestGames );
		this.hotGames = Game.populate( payload.hotGames );
		this.posts = feedService.bootstrap( firesidePostModel.populate( payload.posts ) );

		ChannelsViewHelper.setDefaultMetaData( $stateParams['channel'] );
	}
}
