import { Component, Inject, Input, Output, SkipSelf, Optional } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Screen } from './../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { FeedComponent } from './../../feed-directive';
import { ActivityFeedItem } from './../../item-service';
import template from 'html!./text.html';

@Component({
	selector: 'gj-activity-feed-devlog-post-text',
	template,
})
export class TextComponent
{
	@Input( '<' ) item: ActivityFeedItem;
	@Input( '<' ) isNew = false;

	@Output() onClick: Function;
	@Output() onExpand: Function;

	post: Fireside_Post;
	showFullContent = false;

	constructor(
		@Inject( 'Screen' ) public screen: Screen,
		@Inject( 'gjActivityFeed' ) @SkipSelf() @Optional() public feed: FeedComponent
	)
	{
		this.post = this.item.feedItem as Fireside_Post;
	}

	toggleFull()
	{
		this.showFullContent = !this.showFullContent;
		if ( this.onExpand ) {
			this.onExpand();
		}
	}
}
