import { Injectable, Inject } from 'ng-metadata/core';
import { FiresidePost } from '../../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { App } from '../../../../../../app-service';
import { Meta } from '../../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { ActivityFeedContainer } from '../../../../../../components/activity/feed/feed-container-service';
import { ActivityFeedService } from '../../../../../../components/activity/feed/feed-service';

@Injectable()
export class ListCtrl
{
	posts: ActivityFeedContainer;

	constructor(
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( 'App' ) app: App,
		@Inject( 'gettextCatalog' ) gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'payload' ) payload: any
	)
	{
		app.title = gettextCatalog.getString( 'Devlog for {{ game }}', { game: $scope['gameCtrl'].game.title } );
		Meta.description = `Stay up to date on all the latest posts for ${$scope['gameCtrl'].game.title} on Game Jolt`;

		this.posts = ActivityFeedService.bootstrap( FiresidePost.populate( payload.posts ) );
	}
}
