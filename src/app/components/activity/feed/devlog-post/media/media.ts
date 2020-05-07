import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import { FiresidePost } from '../../../../../../_common/fireside/post/post-model';
import AppMediaBarLightboxTS, {
	LightboxMediaSource,
} from '../../../../../../_common/media-bar/lightbox/lightbox';
import AppMediaBarLightbox from '../../../../../../_common/media-bar/lightbox/lightbox.vue';
import { MediaItem } from '../../../../../../_common/media-item/media-item-model';
import AppMediaItemPost from '../../../../../../_common/media-item/post/post.vue';
import { Screen } from '../../../../../../_common/screen/screen-service';
import AppEventItemMediaIndicator from '../../../../event-item/media-indicator/media-indicator.vue';
import { ActivityFeedItem } from '../../item-service';
import { ActivityFeedView } from '../../view';

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
	private lightbox?: AppMediaBarLightboxTS;

	readonly Screen = Screen;

	get isHydrated() {
		return this.feed.isItemHydrated(this.item);
	}

	created() {
		this.activeMediaItem = this.post.media[0];
	}

	destroyed() {
		this.destroyLightbox();
	}

	clearActiveItem() {
		this.destroyLightbox();
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
		this.$emit('expanded');
	}

	goPrev() {
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

		// Make sure we moved at a high enough velocity and distance to register the "swipe".
		const velocity = event.velocityX;
		if (Math.abs(velocity) > 0.65 && event.distance > 10) {
			if (velocity > 0) {
				this.goPrev();
			} else {
				this.goNext();
			}
			return;
		}

		this._updateSliderOffset();
	}

	private createLightbox() {
		if (this.lightbox) {
			return;
		}
		const elem = document.createElement('div');
		window.document.body.appendChild(elem);

		this.lightbox = new AppMediaBarLightbox({
			propsData: {
				mediaBar: this,
			},
		});

		this.lightbox.$mount(elem);
	}

	private destroyLightbox() {
		if (!this.lightbox) {
			return;
		}

		this.lightbox.$destroy();
		window.document.body.removeChild(this.lightbox.$el);
		this.lightbox = undefined;
	}

	getIsActiveMediaItem(item: MediaItem) {
		return this.activeMediaItem?.id === item.id;
	}

	onClickFullscreen() {
		this.createLightbox();
	}
}
