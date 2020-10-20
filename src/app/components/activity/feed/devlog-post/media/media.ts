import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../../utils/vue';
import { Analytics } from '../../../../../../_common/analytics/analytics.service';
import { FiresidePost } from '../../../../../../_common/fireside/post/post-model';
import AppLightboxTS from '../../../../../../_common/lightbox/lightbox';
import {
	createLightbox,
	LightboxMediaSource,
} from '../../../../../../_common/lightbox/lightbox-helpers';
import { MediaItem } from '../../../../../../_common/media-item/media-item-model';
import AppMediaItemPost from '../../../../../../_common/media-item/post/post.vue';
import { Screen } from '../../../../../../_common/screen/screen-service';
import AppEventItemMediaIndicator from '../../../../event-item/media-indicator/media-indicator.vue';
import { ActivityFeedItem } from '../../item-service';
import { ActivityFeedKey, ActivityFeedView } from '../../view';

if (!GJ_IS_SSR) {
	const VueTouch = require('vue-touch');
	Vue.use(VueTouch);
}

@Component({
	components: {
		AppMediaItemPost,
		AppEventItemMediaIndicator,
	},
})
export default class AppActivityFeedDevlogPostMedia extends Vue implements LightboxMediaSource {
	@Prop(propRequired(ActivityFeedItem)) item!: ActivityFeedItem;
	@Prop(propRequired(FiresidePost)) post!: FiresidePost;

	@Inject(ActivityFeedKey) feed!: ActivityFeedView;

	page = 1;
	activeMediaItem: MediaItem | null = null;
	isDragging = false;
	isWaitingForFrame = false;
	contentBootstrapped = false;
	private lightbox?: AppLightboxTS;
	readonly Screen = Screen;

	get isHydrated() {
		return this.feed.isItemHydrated(this.item);
	}

	created() {
		this.activeMediaItem = this.post.media[0];
	}

	destroyed() {
		this.closeLightbox();
	}

	onLightboxClose() {
		this.lightbox = undefined;
	}

	getActiveIndex() {
		return this.page - 1;
	}

	getActiveItem() {
		return this.activeMediaItem!;
	}

	getItemCount() {
		return this.post.media.length;
	}

	getItems() {
		return this.post.media;
	}

	goNext() {
		this.page = Math.min(this.page + 1, this.post.media.length);
		this.activeMediaItem = this.post.media[this.page - 1];
		this._updateSliderOffset();
		Analytics.trackEvent('activity-feed', 'media-next');
	}

	goPrev() {
		this.page = Math.max(this.page - 1, 1);
		this.activeMediaItem = this.post.media[this.page - 1];
		this._updateSliderOffset();
		Analytics.trackEvent('activity-feed', 'media-prev');
	}

	async onItemBootstrapped() {
		if (!this.contentBootstrapped) {
			this.contentBootstrapped = true;

			await this.$nextTick();
			this.$emit('content-bootstrapped');
		}

		this._updateSliderOffset();
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

		// Make sure we moved at a high enough velocity and/or distance to register the "swipe".
		const { velocityX, deltaX, distance } = event;

		if (
			// Check if it was a fast flick,
			(Math.abs(velocityX) > 0.55 && distance > 10) ||
			// or if the pan distance was at least ~1/3 of the content area.
			Math.abs(deltaX) >= this.$el.clientWidth / 3
		) {
			if (velocityX > 0 || deltaX > 0) {
				this.goPrev();
			} else {
				this.goNext();
			}
			return;
		}

		this._updateSliderOffset();
	}

	getIsActiveMediaItem(item: MediaItem) {
		return this.activeMediaItem?.id === item.id;
	}

	onClickFullscreen() {
		this.createLightbox();
		Analytics.trackEvent('activity-feed', 'media-fullscreen');
	}

	private createLightbox() {
		if (this.lightbox) {
			return;
		}
		this.lightbox = createLightbox(this);
	}

	private closeLightbox() {
		if (!this.lightbox) {
			return;
		}
		this.lightbox.close();
		this.lightbox = undefined;
	}
}
