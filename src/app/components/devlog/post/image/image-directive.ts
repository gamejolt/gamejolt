import { Component, Input } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../../lib/gj-lib-client/components/fireside/post/post-model';

@Component({
	selector: 'gj-devlog-post-image',
	templateUrl: '/app/components/devlog/post/image/image.html',
})
export class DevlogPostImage
{
	@Input( '<' ) post: Fireside_Post;
	@Input( '<' ) onPostRemoved: Function;
}

