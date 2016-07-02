import { Component, Input, Inject, SkipSelf, Optional } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { App } from './../../../../app-service';
import { DevlogPostEdit } from './../edit/edit-service';
import { FeedComponent } from './../../feed/feed-directive';
import template from './controls.html';

@Component({
	selector: 'gj-devlog-post-controls',
	template,
})
export class ControlsComponent
{
	@Input( '<' ) post: Fireside_Post;

	constructor(
		@Inject( 'App' ) private app: App,
		@Inject( 'Fireside_Post' ) private firesidePostModel: typeof Fireside_Post,
		@Inject( 'DevlogPostEdit' ) private editService: DevlogPostEdit,
		@Inject( 'gjDevlogFeed' ) @SkipSelf() @Optional() private feed: FeedComponent
	)
	{
	}

	showEdit()
	{
		this.editService.show( this.post ).then( post =>
		{
			this.feed.onPostEdited( post );
		} );
	}

	publishPost()
	{
		this.post.$publish().then( _ =>
		{
			this.feed.onPostPublished( this.post );
		} );
	}

	removePost()
	{
		this.post.remove().then( _ =>
		{
			this.feed.onPostRemoved( this.post );
		} );
	}
}
