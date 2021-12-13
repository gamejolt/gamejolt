import { computed } from 'vue';
import { setup } from 'vue-class-component';
import { Inject, Options, Prop, Vue } from 'vue-property-decorator';
import { Analytics } from '../../../../../../_common/analytics/analytics.service';
import { FiresidePost } from '../../../../../../_common/fireside/post/post-model';
import { createLightbox } from '../../../../../../_common/lightbox/lightbox-helpers';
import AppMediaItemPost from '../../../../../../_common/media-item/post/post.vue';
import { Screen } from '../../../../../../_common/screen/screen-service';
import AppEventItemMediaIndicator from '../../../../event-item/media-indicator/media-indicator.vue';
import { ActivityFeedItem } from '../../item-service';
import { ActivityFeedKey, ActivityFeedView } from '../../view';

// TODO(vue3)
// if (!GJ_IS_SSR) {
// 	const VueTouch = require('vue-touch');
// 	VueGlobal.use(VueTouch);
// }

@Options({
	components: {
		AppMediaItemPost,
		AppEventItemMediaIndicator,
	},
})
export default class AppActivityFeedPostMedia extends Vue {
	@Prop({ type: ActivityFeedItem, required: true })
	item!: ActivityFeedItem;

	@Prop({ type: FiresidePost, required: true })
	post!: FiresidePost;

	@Prop({ type: Boolean, required: false, default: false })
	canPlaceSticker!: boolean;

	@Inject({ from: ActivityFeedKey })
	feed!: ActivityFeedView;

	page = 1;
	isDragging = false;
	isWaitingForFrame = false;
	lightbox = setup(() => createLightbox(computed(() => this.post.media)));
	readonly Screen = Screen;

	get isHydrated() {
		return this.feed.isItemHydrated(this.item);
	}

	goNext() {
		if (this.page >= this.post.media.length) {
			this._updateSliderOffset();
			return;
		}

		this.page = Math.min(this.page + 1, this.post.media.length);
		this._updateSliderOffset();
		Analytics.trackEvent('activity-feed', 'media-next');
	}

	goPrev() {
		if (this.page <= 1) {
			this._updateSliderOffset();
			return;
		}

		this.page = Math.max(this.page - 1, 1);
		this._updateSliderOffset();
		Analytics.trackEvent('activity-feed', 'media-prev');
	}

	async onItemBootstrapped() {
		this._updateSliderOffset();
	}

	private _updateSliderOffset(extraOffsetPx = 0) {
		const pagePercent = this.page - 1;
		const pagePx = (this.$refs.slider as HTMLElement).offsetWidth * -pagePercent;
		(this.$refs.slider as HTMLElement).style.transform = `translate3d( ${
			pagePx + extraOffsetPx
		}px, 0, 0 )`;
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

	onClickFullscreen() {
		this.lightbox.show(this.page - 1);
		Analytics.trackEvent('activity-feed', 'media-fullscreen');
	}
}
