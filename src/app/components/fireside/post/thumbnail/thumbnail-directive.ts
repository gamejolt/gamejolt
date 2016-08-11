import { Component, Inject, Input } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import template from 'html!./thumbnail.html';

@Component({
	selector: 'gj-fireside-post-thumbnail',
	template,
})
export class ThumbnailComponent
{
	@Input( '<firesidePost' ) post: Fireside_Post;

	constructor(
		@Inject( 'Environment' ) public environment: any,
	)
	{
	}
}
