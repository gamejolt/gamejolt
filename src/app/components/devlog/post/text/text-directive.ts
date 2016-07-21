import { Component, Inject, Input, Output, SkipSelf, Optional } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Screen } from './../../../../../lib/gj-lib-client/components/screen/screen-service';
import { FeedComponent } from './../../../activity/feed/feed-directive';
import template from 'html!./text.html';

@Component({
	selector: 'gj-devlog-post-text',
	template,
})
export class TextComponent
{
	@Input( '<' ) post: Fireside_Post;
	@Input( '<' ) isNew = false;

	@Output() onClick: Function;
	@Output() onExpand: Function;

	showFullContent = false;

	constructor(
		@Inject( 'Screen' ) public screen: Screen,
		@Inject( 'gjActivityFeed' ) @SkipSelf() @Optional() public feed: FeedComponent
	)
	{
	}

	toggleFull()
	{
		this.showFullContent = !this.showFullContent;
		if ( this.onExpand ) {
			this.onExpand();
		}
	}
}
