import { Component, Inject, Input, Output, AfterViewInit, SkipSelf, Optional, EventEmitter } from 'ng-metadata/core';
import * as template from '!html-loader!./media.html';

import { FiresidePost } from '../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Screen } from '../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { ActivityFeedComponent } from '../../feed-directive';
import { ActivityFeedItem } from '../../item-service';
import { MediaItem } from '../../../../../../lib/gj-lib-client/components/media-item/media-item-model';

@Component({
	selector: 'gj-activity-feed-devlog-post-media',
	template,
})
export class ActivityFeedDevlogPostMediaComponent implements AfterViewInit
{
	@Input( '<' ) item: ActivityFeedItem;
	@Input( '<' ) isNew = false;

	@Output() private onClick = new EventEmitter<void>();
	@Output() private onExpand = new EventEmitter<void>();

	post: FiresidePost;

	page = 1;
	activeMediaItem: MediaItem;

	isDragging = false;
	isWaitingForFrame = false;
	sliderElem: HTMLElement;

	screen = Screen;

	constructor(
		@Inject( '$element' ) private $element: ng.IAugmentedJQuery,
		@Inject( '$window' ) private $window: ng.IWindowService,
		@Inject( '$scope' ) private $scope: ng.IScope,
		@Inject( 'gjActivityFeed' ) @SkipSelf() @Optional() public feed: ActivityFeedComponent,
	)
	{
		this.post = this.item.feedItem as FiresidePost;
		this.activeMediaItem = this.post.media[0];
		Screen.setResizeSpy( $scope, () => this._updateSliderOffset() );
	}

	ngAfterViewInit()
	{
		this.sliderElem = this.$element[0].querySelector( '.devlog-post-media-slider' ) as HTMLElement;
	}

	shouldVideoPlay( mediaItem: any )
	{
		// Must be the active media item and also this post must be in view in the feed.
		return this.activeMediaItem === mediaItem && this.feed.isItemInView( this.item );
	}

	clicked()
	{
		this.onClick.emit( undefined );
	}

	next()
	{
		this.page = Math.min( this.page + 1, this.post.media.length );
		this.activeMediaItem = this.post.media[ this.page - 1 ];
		this._updateSliderOffset();
		if ( this.onExpand ) {
			this.onExpand.emit( undefined );
		}
	}

	prev()
	{
		this.page = Math.max( this.page - 1, 1 );
		this.activeMediaItem = this.post.media[ this.page - 1 ];
		this._updateSliderOffset();
		if ( this.onExpand ) {
			this.onExpand.emit( undefined );
		}
	}

	private _updateSliderOffset( extraOffsetPx = 0 )
	{
		const pagePercent = (this.page - 1);
		const pagePx = this.sliderElem.offsetWidth * -pagePercent;
		this.sliderElem.style.transform = `translate3d( ${pagePx + extraOffsetPx}px, 0, 0 )`;
	}

	panStart()
	{
		this.isDragging = true;
	}

	pan( $event: ng.IAngularEvent )
	{
		if ( !this.isWaitingForFrame ) {
			this.isWaitingForFrame = true;
			this.$window.requestAnimationFrame( () => this._panTick( $event ) );
		}
	}

	private _panTick( $event: any )
	{
		this.isWaitingForFrame = false;

		// In case the animation frame was retrieved after we stopped dragging.
		if ( !this.isDragging ) {
			return;
		}

		this._updateSliderOffset( $event['deltaX'] );
	}

	panEnd( $event: any )
	{
		this.isDragging = false;

		this.$scope.$apply( () =>
		{
			// Make sure we moved at a high enough velocity and distance to register the "swipe".
			const velocity = $event['velocityX'];
			if ( Math.abs( velocity ) > 0.65 && $event['distance'] > 10 ) {
				if ( velocity > 0 ) {
					this.next();
				}
				else {
					this.prev();
				}
				return;
			}

			this._updateSliderOffset();
		} );
	}
}

