import { Component, Input, Output, EventEmitter } from 'ng-metadata/core';
import * as template from '!html-loader!./sketchfab.component.html';

import { FiresidePost } from '../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { FiresidePostSketchfab } from '../../../../../../lib/gj-lib-client/components/fireside/post/sketchfab/sketchfab-model';

@Component({
	selector: 'gj-activity-feed-devlog-post-sketchfab',
	template,
})
export class ActivityFeedDevlogPostSketchfabComponent
{
	@Input( '<' ) post: FiresidePost;

	@Output() private onExpand = new EventEmitter<void>();

	sketchfab: FiresidePostSketchfab;
	isShowing = false;

	constructor()
	{
		this.sketchfab = this.post.sketchfabs[0];
	}

	play()
	{
		this.isShowing = true;
		if ( this.onExpand ) {
			this.onExpand.emit( undefined );
		}
	}
}
