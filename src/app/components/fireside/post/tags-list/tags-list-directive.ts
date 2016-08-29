import { Component, Input } from 'ng-metadata/core';
import { Fireside_Post_Tag } from './../../../../../lib/gj-lib-client/components/fireside/post/tag/tag-model';
import template from 'html!./tags-list.html';

@Component({
	selector: 'gj-fireside-post-tags-list',
	template,
})
export class TagsListComponent
{
	@Input( '<' ) tags: Fireside_Post_Tag[];

	constructor(
	)
	{
	}
}
