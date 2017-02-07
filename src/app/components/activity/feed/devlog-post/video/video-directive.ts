import { Component, Input, Output, EventEmitter } from 'ng-metadata/core';
import { FiresidePost } from '../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { FiresidePostVideo } from '../../../../../../lib/gj-lib-client/components/fireside/post/video/video-model';
import * as template from '!html-loader!./video.html';

@Component({
	selector: 'gj-activity-feed-devlog-post-video',
	template,
})
export class ActivityFeedDevlogPostVideoComponent
{
	@Input( '<' ) post: FiresidePost;

	@Output() private onExpand = new EventEmitter<void>();

	video: FiresidePostVideo;
	isShowingVideo = false;

	constructor()
	{
		this.video = this.post.videos[0];
	}

	play()
	{
		this.isShowingVideo = true;
		if ( this.onExpand ) {
			this.onExpand.emit( undefined );
		}
	}
}
