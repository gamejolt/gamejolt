import { Component, Inject, Input, Output, SkipSelf, Optional } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Screen } from './../../../../../lib/gj-lib-client/components/screen/screen-service';
import { FeedComponent } from './../feed-directive';
import { ActivityFeedItem } from './../item-service';
import { DevlogPostViewModal } from './../../../devlog/post/view-modal/view-modal-service';
import template from 'html!./devlog-post.html';

@Component({
	selector: 'gj-activity-feed-devlog-post',
	template,
})
export class DevlogPostComponent
{
	@Input( '<' ) item: ActivityFeedItem;
	@Input( '<' ) isNew = false;

	@Output() onClick: Function;
	@Output() onExpand: Function;

	post: Fireside_Post;
	icon: string;

	constructor(
		@Inject( 'Screen' ) public screen: Screen,
		@Inject( 'DevlogPostViewModal' ) private viewModal: DevlogPostViewModal,
		@Inject( 'gjActivityFeed' ) @SkipSelf() @Optional() public feed: FeedComponent,
	)
	{
		this.post = this.item.feedItem as Fireside_Post;

		if ( this.post.type == 'text' ) {
			this.icon = 'blog-article';
		}
		else if ( this.post.type == 'media' ) {
			this.icon = 'screenshot';
		}
		else if ( this.post.type == 'video' ) {
			this.icon = 'video';
		}
	}

	_onClick( $event: ng.IAngularEvent )
	{
		if ( this.screen.isXs ) {
			this.viewModal.show( this.post );
			$event.preventDefault();
		}
	}
}
