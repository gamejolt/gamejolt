import { Component, Input, Inject, SkipSelf, Optional } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { FeedComponent } from './../../../activity/feed/feed-directive';
import template from './text.html';

@Component({
	selector: 'gj-devlog-post-text',
	template,
})
export class TextComponent
{
	@Input( '<' ) post: Fireside_Post;

	constructor(
		@Inject( 'gjActivityFeed' ) @SkipSelf() @Optional() private feed: FeedComponent
	)
	{
	}

	onPostClick()
	{
		this.feed.setActive( this.post.id );
	}
}
