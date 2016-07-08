import { Component, Input, Inject, SkipSelf, Optional } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { FeedComponent } from './../../../activity/feed/feed-directive';
import template from './media.html';

@Component({
	selector: 'gj-devlog-post-media',
	template,
})
export class MediaComponent
{
	page = 1;

	@Input( '<' ) post: Fireside_Post;

	constructor(
		@Inject( 'gjActivityFeed' ) @SkipSelf() @Optional() private feed: FeedComponent
	)
	{
	}

	next()
	{
		++this.page;
	}

	prev()
	{
		--this.page;
	}

	onPostClick()
	{
		this.feed.setActive( this.post.id );
	}
}

