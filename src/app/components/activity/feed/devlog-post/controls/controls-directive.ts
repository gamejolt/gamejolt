import { Component, Input, Output, Inject, SkipSelf, Optional } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Fireside_Post_Like } from './../../../../../../lib/gj-lib-client/components/fireside/post/like/like-model';
import { App } from './../../../../../app-service';
import { DevlogPostEdit } from './../../../../devlog/post/edit/edit-service';
import { FeedComponent } from './../../feed-directive';
import template from 'html!./controls.html';

@Component({
	selector: 'gj-activity-feed-devlog-post-controls',
	template,
})
export class ControlsComponent
{
	@Input( '<' ) post: Fireside_Post;

	@Output() onExpand: Function;

	isShowingComments = false;
	isShowingLikes = false;
	hasLoadedLikes = false;
	likes: Fireside_Post_Like[] = [];

	constructor(
		@Inject( 'App' ) public app: App,
		@Inject( 'Fireside_Post' ) public firesidePostModel: typeof Fireside_Post,
		@Inject( 'DevlogPostEdit' ) private editService: DevlogPostEdit,
		@Inject( 'gjActivityFeed' ) @SkipSelf() @Optional() private feed: FeedComponent
	)
	{
	}

	toggleComments()
	{
		this.isShowingComments = !this.isShowingComments;
		this.isShowingLikes = false;
		this.onExpand();
	}

	toggleLikes()
	{
		this.isShowingLikes = !this.isShowingLikes;
		this.isShowingComments = false;
		this.onExpand();

		if ( this.isShowingLikes ) {
			this.loadLikes();
		}
	}

	loadLikes()
	{
		this.post.fetchLikes()
			.then( ( likes ) =>
			{
				this.likes = likes;
				this.hasLoadedLikes = true;
			} );
	}

	showEdit()
	{
		this.editService.show( this.post )
			.then( ( post: Fireside_Post ) => this.feed.onPostEdited( post ) );
	}

	publishPost()
	{
		this.post.$publish()
			.then( () => this.feed.onPostPublished( this.post ) );
	}

	removePost()
	{
		this.post.remove()
			.then( () => this.feed.onPostRemoved( this.post ) );
	}
}
