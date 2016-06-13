import { Component, Input } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../lib/gj-lib-client/components/fireside/post/post-model';

@Component({
	selector: 'gj-devlog-feed',
	templateUrl: '/app/components/devlog/feed/feed.html',
	legacy: {
		controllerAs: '$ctrl',
	},
})
export class DevlogFeed
{
	@Input( '<devlogPosts' ) posts: Fireside_Post[];
}
