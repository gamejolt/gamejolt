import { Component, Input, Inject } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../lib/gj-lib-client/components/fireside/post/post-model';

@Component({
	selector: 'gj-devlog-feed',
	templateUrl: '/app/components/devlog/feed/feed.html',
})
export class DevlogFeed
{
	@Input( '<devlogPosts' ) posts: Fireside_Post[];

	constructor(
		@Inject( 'Fireside_Post' ) private firesidePost: typeof Fireside_Post
	)
	{

	}
}
