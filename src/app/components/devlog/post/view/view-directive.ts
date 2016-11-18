import { Component, Input } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import template from 'html!./view.html';

@Component({
	selector: 'gj-devlog-post-view',
	template,
})
export class ViewComponent
{
	@Input( '<' ) post: Fireside_Post;
	@Input( '<?' ) showGameInfo = false;
	@Input( '<?' ) inModal = false;

	constructor(
	)
	{
	}
}
