import { Injectable, Inject } from 'ng-metadata/core';
import { StateParams } from 'angular-ui-router';

import { App } from '../../../app-service';
import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { FiresidePost } from '../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { ActivityFeedContainer } from '../../../components/activity/feed/feed-container-service';
import { ActivityFeedService } from '../../../components/activity/feed/feed-service';

@Injectable()
export class DevlogsTagCtrl
{
	tag: string;
	items: ActivityFeedContainer;

	constructor(
		@Inject( '$stateParams' ) $stateParams: StateParams,
		@Inject( 'App' ) app: App,
		@Inject( 'payload' ) payload: any,
	)
	{
		this.tag = $stateParams['tag'];

		app.title = `Devlog Entries for ${this.tag}`;
		Meta.description = `Follow along on the latest development for ${this.tag}!`;

		this.items = ActivityFeedService.bootstrap( FiresidePost.populate( payload.items ) );
	}
}
