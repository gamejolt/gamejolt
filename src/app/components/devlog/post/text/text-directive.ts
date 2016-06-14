import { Component, Input } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../../lib/gj-lib-client/components/fireside/post/post-model';

@Component({
	selector: 'gj-devlog-post-text',
	templateUrl: '/app/components/devlog/post/text/text.html',
})
export class DevlogPostText
{
	@Input( '<' ) post: Fireside_Post;
}
