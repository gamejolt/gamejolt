import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../../app-service';
import { Meta } from './../../../../lib/gj-lib-client/components/meta/meta-service';
import { Fireside_Post } from './../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { ActivityFeedContainer } from './../../../components/activity/feed/feed-container-service';
import { ActivityFeedService } from './../../../components/activity/feed/feed-service';

@Injectable()
export class DevlogsTagCtrl
{
	tag: string;
	items: ActivityFeedContainer;

	constructor(
		@Inject( '$stateParams' ) $stateParams: ng.ui.IStateParamsService,
		@Inject( 'App' ) app: App,
		@Inject( 'Meta' ) meta: Meta,
		@Inject( 'Fireside_Post' ) firesidePostModel: typeof Fireside_Post,
		@Inject( 'ActivityFeedService' ) feedService: ActivityFeedService,
		@Inject( 'payload' ) payload: any,
	)
	{
		this.tag = $stateParams['tag'];

		app.title = `Devlog Entries for ${this.tag}`;
		meta.description = `Follow along on the latest development for ${this.tag}!`;

		this.items = feedService.bootstrap( firesidePostModel.populate( payload.items ) );
	}
}
