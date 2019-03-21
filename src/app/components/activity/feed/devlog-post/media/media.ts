import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { MediaItem } from 'game-jolt-frontend-lib/components/media-item/media-item-model';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import AppEventItemMediaIndicator from '../../../../event-item/media-indicator/media-indicator.vue';
import { ActivityFeedItem } from '../../item-service';
import { ActivityFeedView } from '../../view';
import AppActivityFeedDevlogPostMediaItem from './item/item.vue';

if (!GJ_IS_SSR) {
	const VueTouch = require('vue-touch');
	Vue.use(VueTouch);
}

@Component({
	components: {
		AppActivityFeedDevlogPostMediaItem,
		AppEventItemMediaIndicator,
	},
})
export default class AppActivityFeedDevlogPostMedia extends Vue {
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

	async onItemBootstrapped() {
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
