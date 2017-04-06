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

	// We bind-once canToggleContent. It needs to be undefined so that it
	// doesn't bind until we know if the content can be toggled.
	canToggleContent: boolean | undefined = undefined;
	showFullContent = false;

	toggleFull()
	{
		this.showFullContent = !this.showFullContent;
		if ( this.onExpand ) {
			this.onExpand();
		}
	}
}
