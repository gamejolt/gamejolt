import { Component, Input, Output, EventEmitter } from 'ng-metadata/core';
import { FiresidePost } from '../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import * as template from '!html-loader!./text.html';

@Component({
	selector: 'gj-activity-feed-devlog-post-text',
	template,
})
export class ActivityFeedDevlogPostTextComponent
{
	@Input( '<' ) post: FiresidePost;

	@Output() private onExpand = new EventEmitter<void>();

	// We bind-once canToggleContent. It needs to be undefined so that it
	// doesn't bind until we know if the content can be toggled.
	canToggleContent: boolean | undefined = undefined;
	showFullContent = false;

	toggleFull()
	{
		this.showFullContent = !this.showFullContent;
		if ( this.onExpand ) {
			this.onExpand.emit( undefined );
		}
	}
}
