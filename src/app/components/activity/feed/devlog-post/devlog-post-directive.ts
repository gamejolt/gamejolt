import { Component, Inject, Input, Output, SkipSelf, Optional, EventEmitter } from 'ng-metadata/core';
import { FiresidePost } from '../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { ActivityFeedComponent } from '../feed-directive';
import { ActivityFeedItem } from '../item-service';
import { DevlogPostViewModal } from '../../../devlog/post/view-modal/view-modal-service';
import * as template from '!html-loader!./devlog-post.html';

@Component({
	selector: 'gj-activity-feed-devlog-post',
	template,
})
export class ActivityFeedDevlogPostComponent
{
	@Input( '<' ) item: ActivityFeedItem;

	@Output() private onExpand = new EventEmitter<void>();

	post: FiresidePost;
	icon: string;

	constructor(
		@Inject( 'Screen' ) public screen: Screen,
		@Inject( 'DevlogPostViewModal' ) private viewModal: DevlogPostViewModal,
		@Inject( 'gjActivityFeed' ) @SkipSelf() @Optional() public feed: ActivityFeedComponent,
	)
	{
		this.post = this.item.feedItem as FiresidePost;

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

	expanded()
	{
		this.onExpand.emit( undefined );
	}

	_onClick( $event: ng.IAngularEvent )
	{
		if ( this.screen.isXs ) {
			this.viewModal.show( this.post );
			$event.preventDefault();
		}
	}
}
