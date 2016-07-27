import { Component, Input, Output } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Fireside_Post_Video } from './../../../../../../lib/gj-lib-client/components/fireside/post/video/video-model';
// import { ActivityFeedItem } from './../../item-service';
import template from 'html!./video.html';

@Component({
	selector: 'gj-activity-feed-devlog-post-video',
	template,
})
export class VideoComponent
{
	@Input( '<' ) post: Fireside_Post;

	@Output() onExpand: Function;

	video: Fireside_Post_Video;
	isShowingVideo = false;

	constructor()
	{
		this.video = this.post.videos[0];
	}

	play()
	{
		this.isShowingVideo = true;
		if ( this.onExpand ) {
			this.onExpand();
		}
	}
}
