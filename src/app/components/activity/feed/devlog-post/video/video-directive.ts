import { Component, Inject, Input, Output, SkipSelf, Optional } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Fireside_Post_Video } from './../../../../../../lib/gj-lib-client/components/fireside/post/video/video-model';
import { Screen } from './../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { FeedComponent } from './../../feed-directive';
import { ActivityFeedItem } from './../../item-service';
import template from 'html!./video.html';

@Component({
	selector: 'gj-activity-feed-devlog-post-video',
	template,
})
export class VideoComponent
{
	@Input( '<' ) item: ActivityFeedItem;
	@Input( '<' ) isNew = false;

	@Output() onClick: Function;
	@Output() onExpand: Function;

	post: Fireside_Post;
	video: Fireside_Post_Video;

	isShowingVideo = false;

	constructor(
		@Inject( 'Screen' ) public screen: Screen,
		@Inject( 'gjActivityFeed' ) @SkipSelf() @Optional() public feed: FeedComponent
	)
	{
		this.post = this.item.feedItem as Fireside_Post;
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
