import { Injectable, Inject } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { App } from './../../../../../../app-service';
import { ActivityFeedContainer } from './../../../../../../components/activity/feed/feed-container-service';
import { ActivityFeedService } from './../../../../../../components/activity/feed/feed-service';

@Injectable()
export class ListCtrl
{
	posts: ActivityFeedContainer;

	constructor(
		@Inject( '$scope' ) $scope: angular.IScope,
		@Inject( 'App' ) app: App,
		@Inject( 'Fireside_Post' ) firesidePostModel: typeof Fireside_Post,
		@Inject( 'gettextCatalog' ) gettextCatalog: angular.gettext.gettextCatalog,
		@Inject( 'ActivityFeedService' ) feedService: ActivityFeedService,
		@Inject( 'payload' ) payload: any
	)
	{
		app.title = gettextCatalog.getString( 'Devlog for {{ game }}', { game: $scope['gameCtrl'].game.title } );
		this.posts = feedService.bootstrap( firesidePostModel.populate( payload.posts ) );
	}
}
