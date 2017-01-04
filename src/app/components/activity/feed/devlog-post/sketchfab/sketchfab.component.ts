import { Component, Input, Output } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import template from 'html!./sketchfab.component.html';
import { Fireside_Post_Sketchfab } from '../../../../../../lib/gj-lib-client/components/fireside/post/sketchfab/sketchfab-model';

@Component({
	selector: 'gj-activity-feed-devlog-post-sketchfab',
	template,
})
export class ActivityFeedDevlogPostSketchfabComponent
{
	@Input( '<' ) post: Fireside_Post;

	@Output() onExpand: Function;

	sketchfab: Fireside_Post_Sketchfab;
	isShowing = false;

	constructor()
	{
		this.sketchfab = this.post.sketchfabs[0];
	}

	play()
	{
		this.isShowing = true;
		if ( this.onExpand ) {
			this.onExpand();
		}
	}
}
