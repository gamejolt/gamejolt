import { nextTick } from 'vue';
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { Analytics } from '../../analytics/analytics.service';
import { Growls } from '../../growls/growls.service';
import AppLightboxItem from '../../lightbox/item/item.vue';
import AppLightboxTS from '../../lightbox/lightbox';
import { createLightbox, LightboxMediaSource } from '../../lightbox/lightbox-helpers';
import AppLightbox from '../../lightbox/lightbox.vue';
import AppLoading from '../../loading/loading.vue';
import AppScrollScroller from '../../scroll/scroller/scroller.vue';
import { MediaBarItemMaxHeight } from './item/item';
import AppGameMediaBarItem from './item/item.vue';

@Options({
	components: {
		AppLoading,
		AppLightboxItem,
		AppLightbox,
		AppScrollScroller,
		AppGameMediaBarItem,
	},
})
export default class AppGameMediaBar extends Vue implements LightboxMediaSource {
	@Prop(Array) mediaItems!: any[];

	private urlChecked = false;
	private lightbox?: AppLightboxTS;

	activeItem: any | null = null;
	activeIndex: number | null = null;
	mediaBarHeight = MediaBarItemMaxHeight + 40;

	@Watch('activeItem')
	activeItemChange() {
		if (this.activeItem && !this.lightbox) {
			this.createLightbox();
		} else if (!this.activeItem && this.lightbox) {
			this.closeLightbox();
		}

		let hash = '';
		if (this.activeItem) {
			if (this.activeItem.media_type === 'image') {
				hash = '#screenshot-';
			} else if (this.activeItem.media_type === 'video') {
				hash = '#video-';
			} else if (this.activeItem.media_type === 'sketchfab') {
				hash = '#sketchfab-';
			}
			hash += this.activeItem.id;
		}

		if (this.$router) {
			this.$router.replace({ hash });
		}
	}

	async updated() {
		// It seems like since we were changing state in the updated event it
		// wasn't correctly seeing that the check URL updates the state. Using
		// next tick to fix this.
		if (typeof this.mediaItems !== 'undefined' && !this.urlChecked) {
			this.urlChecked = true;
			await nextTick();
			this.checkUrl();
		}
	}

	unmounted() {
		this.closeLightbox();
	}

	onLightboxClose() {
		this.lightbox = undefined;
		this.activeItem = null;
		this.activeIndex = null;
		this.trackEvent('close');
	}

	getActiveIndex() {
		return this.activeIndex!;
	}

	getItemCount() {
		return this.mediaItems.length;
	}

	getActiveItem() {
		return this.activeItem;
	}

	getItems() {
		return this.mediaItems;
	}

	setActiveItem(item: any) {
		let index = item;
		if (typeof item === 'object') {
			index = this.mediaItems.findIndex(_item => _item.id === item.id);
		}

		this.go(index);
		this.trackEvent('item-click', index);
	}

	goNext() {
		if (this.activeIndex === null || this.activeIndex + 1 >= this.mediaItems.length) {
			return;
		}

		this.go(this.activeIndex + 1);
		this.trackEvent('next');
	}

	goPrev() {
		if (this.activeIndex === null || this.activeIndex - 1 < 0) {
			return;
		}

		this.go(this.activeIndex - 1);
		this.trackEvent('prev');
	}

	go(index: number) {
		this.activeIndex = index;
		this.activeItem = this.mediaItems[this.activeIndex];
	}

	private checkUrl() {
		// If there is a hash in the URL, let's try to load it in.
		let id: number | undefined;
		const hash = window.location.hash.substring(1);
		if (hash) {
			let type: string | undefined;
			if (hash.indexOf('screenshot-') !== -1) {
				id = parseInt(hash.substring('screenshot-'.length), 10);
				type = 'image';
			} else if (hash.indexOf('video-') !== -1) {
				id = parseInt(hash.substring('video-'.length), 10);
				type = 'video';
			} else if (hash.indexOf('sketchfab-') !== -1) {
				id = parseInt(hash.substring('sketchfab-'.length), 10);
				type = 'sketchfab';
			}

			if (id && type) {
				const item = this.mediaItems.find(_item => _item.id === id);
				if (item) {
					this.setActiveItem(item);
					this.trackEvent('permalink');
				} else {
					if (type === 'image') {
						Growls.error(
							this.$gettext(
								`We couldn't find the image that was linked. It may have been removed.`
							),
							this.$gettext(`Invalid Image URL`)
						);
					} else if (type === 'video') {
						Growls.error(
							this.$gettext(
								`We couldn't find the video that was linked. It may have been removed.`
							),
							this.$gettext(`Invalid Video URL`)
						);
					} else if (type === 'sketchfab') {
						Growls.error(
							this.$gettext(
								`We couldn't find the sketchfab model that was linked. It may have been removed.`
							),
							this.$gettext(`Invalid Sketchfab URL`)
						);
					}
					this.trackEvent('permalink-invalid');
				}
			}
		}
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

	private trackEvent(action: string, label?: string) {
		Analytics.trackEvent('media-bar', action, label);
	}
}
