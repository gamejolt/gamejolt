import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./media.html?style=./media.styl';

import { FiresidePost } from '../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Screen } from '../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { ActivityFeedItem } from '../../item-service';
import { MediaItem } from '../../../../../../lib/gj-lib-client/components/media-item/media-item-model';
import { makeObservableService, findVueParent } from '../../../../../../lib/gj-lib-client/utils/vue';
import { AppActivityFeed } from '../../feed';
import { AppJolticon } from '../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppImgResponsive } from '../../../../../../lib/gj-lib-client/components/img/responsive/responsive';
import { AppVideo } from '../../../../../../lib/gj-lib-client/components/video/video';
import { AppResponsiveDimensions } from '../../../../../../lib/gj-lib-client/components/responsive-dimensions/responsive-dimensions';

if ( !GJ_IS_SSR ) {
	const VueTouch = require( 'vue-touch' );
	Vue.use( VueTouch );
}

@View
@Component({
	name: 'activity-feed-devlog-post-media',
	components: {
		AppJolticon,
		AppImgResponsive,
		AppVideo,
		AppResponsiveDimensions,
	},
})
export class AppActivityFeedDevlogPostMedia extends Vue
{
	@Prop( ActivityFeedItem ) item: ActivityFeedItem;
	@Prop( Boolean ) isNew?: boolean;

	post: FiresidePost;

	page = 1;
	activeMediaItem: MediaItem | null = null;
	feed: AppActivityFeed = {} as AppActivityFeed;

	isDragging = false;
	isWaitingForFrame = false;

	Screen = makeObservableService( Screen );

	created()
	{
		this.feed = findVueParent( this, AppActivityFeed ) as AppActivityFeed;
		this.post = this.item.feedItem as FiresidePost;
		this.activeMediaItem = this.post.media[0];
		// Screen.setResizeSpy( $scope, () => this._updateSliderOffset() );
	}

	shouldVideoPlay( mediaItem: any )
	{
		// Must be the active media item and also this post must be in view in the feed.
		return this.activeMediaItem === mediaItem && this.feed.isItemInView( this.item );
	}

	clicked()
	{
		this.$emit( 'clicked' );
	}

	next()
	{
		this.page = Math.min( this.page + 1, this.post.media.length );
		this.activeMediaItem = this.post.media[ this.page - 1 ];
		this._updateSliderOffset();
		this.$emit( 'expanded' );
	}

	prev()
	{
		this.page = Math.max( this.page - 1, 1 );
		this.activeMediaItem = this.post.media[ this.page - 1 ];
		this._updateSliderOffset();
		this.$emit( 'expanded' );
	}

	private _updateSliderOffset( extraOffsetPx = 0 )
	{
		const pagePercent = (this.page - 1);
		const pagePx = (this.$refs.slider as HTMLElement).offsetWidth * -pagePercent;
		(this.$refs.slider as HTMLElement).style.transform = `translate3d( ${pagePx + extraOffsetPx}px, 0, 0 )`;
	}

	panStart()
	{
		this.isDragging = true;
	}

	pan( $event: ng.IAngularEvent )
	{
		if ( !this.isWaitingForFrame ) {
			this.isWaitingForFrame = true;
			window.requestAnimationFrame( () => this._panTick( $event ) );
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

		// Make sure we moved at a high enough velocity and distance to register the "swipe".
		const velocity = $event['velocityX'];
		if ( Math.abs( velocity ) > 0.65 && $event['distance'] > 10 ) {
			if ( velocity > 0 ) {
				this.prev();
			}
			else {
				this.next();
			}
			return;
		}

		this._updateSliderOffset();
	}
}
