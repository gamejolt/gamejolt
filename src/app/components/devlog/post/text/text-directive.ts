import { Component, Input, Inject } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { DevlogFeedService } from './../../feed/feed-service';
import template from './text.html';

@Component({
	selector: 'gj-devlog-post-text',
	template,
})
export class TextComponent
{
	@Input( '<' ) post: Fireside_Post;

	constructor(
		@Inject( 'DevlogFeedService' ) private feedService: DevlogFeedService
	)
	{
	}

	onPostClick()
	{
		this.feedService.setActive( this.post.id );
	}
}
