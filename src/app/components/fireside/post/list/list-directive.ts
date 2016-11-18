import { Component, Input } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import template from 'html!./list.html';

@Component({
	selector: 'gj-fireside-post-list',
	template,
})
export class ListComponent
{
	@Input( '<firesidePosts' ) posts: Fireside_Post[];

	constructor()
	{
	}
}
