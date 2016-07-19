import { Component, Inject, Input, Output, AfterViewInit, SkipSelf, Optional } from 'ng-metadata/core';
import { Fireside_Post } from './../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Screen } from './../../../../../lib/gj-lib-client/components/screen/screen-service';
import { FeedComponent } from './../../../activity/feed/feed-directive';
import template from 'html!./media.html';

@Component({
	selector: 'gj-devlog-post-media',
	template,
})
export class MediaComponent implements AfterViewInit
{
	@Input( '<' ) post: Fireside_Post;

	@Output() onClick: Function;
	@Output() onExpand: Function;

	page = 1;

	isDragging = false;
	hasDragged = false;
	isWaitingForFrame = false;
	sliderElem: HTMLElement;

	constructor(
		@Inject( '$element' ) private $element: ng.IAugmentedJQuery,
		@Inject( '$window' ) private $window: ng.IWindowService,
		@Inject( '$scope' ) private $scope: ng.IScope,
		@Inject( 'Screen' ) private screen: Screen,
		@Inject( 'gjActivityFeed' ) @SkipSelf() @Optional() private feed: FeedComponent
	)
	{
		screen.setResizeSpy( $scope, () => this._updateSliderOffset() );
	}

	ngAfterViewInit()
	{
		this.sliderElem = this.$element[0].querySelector( '.devlog-post-media-slider' );
	}

	next()
	{
		this.page = Math.min( this.page + 1, this.post.media.length );
		this._updateSliderOffset();
		if ( this.onExpand ) {
			this.onExpand();
		}
	}

	prev()
	{
		this.page = Math.max( this.page - 1, 1 );
		this._updateSliderOffset();
		if ( this.onExpand ) {
			this.onExpand();
		}
	}

	private _updateSliderOffset( extraOffsetPx = 0 )
	{
		const pagePercent = (this.page - 1);
		const pagePx = this.sliderElem.offsetWidth * -pagePercent;
		this.sliderElem.style.transform = `translate3d( ${pagePx + extraOffsetPx}px, 0, 0 )`;
	}

	panStart( $event: ng.IAngularEvent )
	{
		this.$scope.$apply( () =>
		{
			this.isDragging = true;
			this.hasDragged = true;
		} );
	};

	pan( $event: ng.IAngularEvent )
	{
		if ( !this.isWaitingForFrame ) {
			this.isWaitingForFrame = true;
			this.$window.requestAnimationFrame( () => this._panTick( $event ) );
		}
	};

	private _panTick( $event: ng.IAngularEvent )
	{
		this.isWaitingForFrame = false;

		// In case the animation frame was retrieved after we stopped dragging.
		if ( !this.isDragging ) {
			return;
		}

		this._updateSliderOffset( $event['deltaX'] );
	}

	panEnd( $event: ng.IAngularEvent )
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
	};
}

