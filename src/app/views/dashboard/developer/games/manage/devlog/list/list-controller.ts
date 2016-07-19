import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../../../../../../app-service';
import { Fireside_Post } from '../../../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { ActivityFeedService } from './../../../../../../../components/activity/feed/feed-service';
import { ActivityFeedContainer } from './../../../../../../../components/activity/feed/feed-container-service';

@Injectable()
export class ListCtrl
{
	posts: ActivityFeedContainer;
	draftPosts: ActivityFeedContainer;
	showNewPost: string | null = null;
	tab: 'active' | 'draft' = 'active';

	constructor(
		@Inject( 'App' ) app: App,
		@Inject( 'Fireside_Post' ) private firesidePostModel: typeof Fireside_Post,
		@Inject( 'ActivityFeedService' ) feedService: ActivityFeedService,
		@Inject( 'gettextCatalog' ) gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'payload' ) payload: any
	)
	{
		app.title = gettextCatalog.getString( 'Manage Devlog' );

		this.posts = feedService.bootstrap( firesidePostModel.populate( payload.posts ) );
		this.draftPosts = feedService.bootstrap( firesidePostModel.populate( payload.draftPosts ) );
	}

	onPostAdded( post: Fireside_Post )
	{
		if ( post.status == this.firesidePostModel.STATUS_ACTIVE ) {
			this.posts.prepend( [ post ] );
		}
		else if ( post.status == this.firesidePostModel.STATUS_DRAFT ) {
			this.draftPosts.prepend( [ post ] );
		}
	}

	onPostPublished( post: Fireside_Post )
	{
		this.posts.prepend( [ post ] );
		this.draftPosts.remove( post );
		this.tab = 'active';
	}
}
