import { Component, Input } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import template from 'html!./feed.html';

@Component({
	selector: 'gj-post-feed',
	template,
})
export class FeedComponent
{
	@Input( '<' ) posts: Fireside_Post[];

	constructor(
	)
	{
	}
}
