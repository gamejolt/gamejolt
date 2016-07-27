import { Component, Input, Output } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import template from 'html!./text.html';

@Component({
	selector: 'gj-activity-feed-devlog-post-text',
	template,
})
export class TextComponent
{
	@Input( '<' ) post: Fireside_Post;

	@Output() onExpand: Function;

	canToggleContent: boolean | undefined;
	showFullContent = false;

	toggleFull()
	{
		this.showFullContent = !this.showFullContent;
		if ( this.onExpand ) {
			this.onExpand();
		}
	}
}
