import { Component, Input, Inject } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { DevlogFeedService } from './../../feed/feed-service';
import template from './media.html'

@Component({
	selector: 'gj-devlog-post-media',
	template,
})
export class MediaComponent
{
	page = 1;

	@Input( '<' ) post: Fireside_Post;

	constructor(
		@Inject( 'DevlogFeedService' ) private feedService: DevlogFeedService
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
		this.feedService.setActive( this.post.id );
	}
}

