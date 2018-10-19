import View from '!view!./media.html?style=./media.styl';
import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import { FiresidePost } from '../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { AppImgResponsive } from '../../../../../../lib/gj-lib-client/components/img/responsive/responsive';
import { MediaItem } from '../../../../../../lib/gj-lib-client/components/media-item/media-item-model';
import { AppResponsiveDimensions } from '../../../../../../lib/gj-lib-client/components/responsive-dimensions/responsive-dimensions';
import { Screen } from '../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppVideo } from '../../../../../../lib/gj-lib-client/components/video/video';
import { AppEventItemMediaIndicator } from '../../../../event-item/media-indicator/media-indicator';
import { AppEventItemMediaTags } from '../../../../event-item/media-tags/media-tags';
import { ActivityFeedItem } from '../../item-service';
import { ActivityFeedView } from '../../view';

if (!GJ_IS_SSR) {
	const VueTouch = require('vue-touch');
	Vue.use(VueTouch);
}

@View
@Component({
	components: {
		AppImgResponsive,
		AppVideo,
		AppResponsiveDimensions,
		AppEventItemMediaTags,
		AppEventItemMediaIndicator,
	},
})
export class AppActivityFeedDevlogPostMedia extends Vue {
	@Inject()
	feed!: ActivityFeedView;

	@Prop(ActivityFeedItem)
	item!: ActivityFeedItem;

	@Prop(FiresidePost)
	post!: FiresidePost;

	page = 1;
	activeMediaItem: MediaItem | null = null;
	isDragging = false;
	isWaitingForFrame = false;
	contentBootstrapped = false;

	readonly Screen = Screen;

	get isHydrated() {
		return this.feed.isItemHydrated(this.item);
	}

	created() {
		this.activeMediaItem = this.post.media[0];
	}

	shouldVideoPlay(mediaItem: any) {
		// Must be the active media item.
		return this.activeMediaItem === mediaItem;
	}

	next() {
		this.page = Math.min(this.page + 1, this.post.media.length);
		this.activeMediaItem = this.post.media[this.page - 1];
		this._updateSliderOffset();
		this.$emit('expanded');
	}

	prev() {
		this.page = Math.max(this.page - 1, 1);
		this.activeMediaItem = this.post.media[this.page - 1];
		this._updateSliderOffset();
		this.$emit('expanded');
	}

	async onDimensionsChange() {
		if (!this.contentBootstrapped) {
			this.contentBootstrapped = true;

			await this.$nextTick();
			this.$emit('content-bootstrapped');
		}
	}

	private _updateSliderOffset(extraOffsetPx = 0) {
		const pagePercent = this.page - 1;
		const pagePx = (this.$refs.slider as HTMLElement).offsetWidth * -pagePercent;
		(this.$refs.slider as HTMLElement).style.transform = `translate3d( ${pagePx +
			extraOffsetPx}px, 0, 0 )`;
	}

	panStart() {
		this.isDragging = true;
	}

	pan(event: HammerInput) {
		if (!this.isWaitingForFrame) {
			this.isWaitingForFrame = true;
			window.requestAnimationFrame(() => this._panTick(event));
		}
	}

	private _panTick(event: HammerInput) {
		this.isWaitingForFrame = false;

		// In case the animation frame was retrieved after we stopped dragging.
		if (!this.isDragging) {
			return;
		}

		this._updateSliderOffset(event.deltaX);
	}

	panEnd(event: HammerInput) {
		this.isDragging = false;

		// Make sure we moved at a high enough velocity and distance to register the "swipe".
		const velocity = event.velocityX;
		if (Math.abs(velocity) > 0.65 && event.distance > 10) {
			if (velocity > 0) {
				this.prev();
			} else {
				this.next();
			}
			return;
		}

		this._updateSliderOffset();
	}
}
