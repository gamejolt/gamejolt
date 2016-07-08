import { Component, Input, Output } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import template from './media.html';

@Component({
	selector: 'gj-devlog-post-media',
	template,
})
export class MediaComponent
{
	page = 1;

	@Input( '<' ) post: Fireside_Post;
	@Output() onClick: Function;

	next()
	{
		++this.page;
	}

	prev()
	{
		--this.page;
	}
}

