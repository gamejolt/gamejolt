import { Component, Input, Output, Inject, SkipSelf, Optional } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { App } from './../../../../app-service';
import { DevlogPostEdit } from './../edit/edit-service';
import { FeedComponent } from './../../../activity/feed/feed-directive';
import template from './controls.html';

@Component({
	selector: 'gj-devlog-post-controls',
	template,
})
export class ControlsComponent
{
	@Input( '<' ) post: Fireside_Post;

	@Output() onExpand: Function;

	isShowingComments = false;

	constructor(
		@Inject( 'App' ) private app: App,
		@Inject( 'Fireside_Post' ) private firesidePostModel: typeof Fireside_Post,
		@Inject( 'DevlogPostEdit' ) private editService: DevlogPostEdit,
		@Inject( 'gjActivityFeed' ) @SkipSelf() @Optional() private feed: FeedComponent
	)
	{
	}

	toggleComments()
	{
		this.isShowingComments = !this.isShowingComments;
		this.onExpand();
	}

	showEdit()
	{
		this.editService.show( this.post )
			.then( post => this.feed.onPostEdited( post ) );
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
