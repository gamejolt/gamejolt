import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import AppLoading from '../../vue/components/loading/loading.vue';
import { Analytics } from '../analytics/analytics.service';
import { Growls } from '../growls/growls.service';
import AppScrollScroller from '../scroll/scroller/scroller.vue';
import { MediaBarItemMaxHeight } from './item/item';
import AppMediaBarItem from './item/item.vue';
import AppMediaBarLightboxTS from './lightbox/lightbox';
import AppMediaBarLightbox from './lightbox/lightbox.vue';

@Component({
	components: {
		AppLoading,
		AppMediaBarItem,
		AppMediaBarLightbox,
		AppScrollScroller,
	},
})
export default class AppMediaBar extends Vue {
	@Prop(Array) mediaItems!: any[];
	@Prop(Boolean) noOverlayScrollbars?: boolean;

	private urlChecked = false;
	private lightbox?: AppMediaBarLightboxTS;

	activeItem: any | null = null;
	activeIndex: number | null = null;
	mediaBarHeight = MediaBarItemMaxHeight + 40;

	@Watch('activeItem')
	activeItemChange() {
		if (this.activeItem && !this.lightbox) {
			this.createLightbox();
		} else if (!this.activeItem && this.lightbox) {
			this.destroyLightbox();
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
			await this.$nextTick();
			this.checkUrl();
		}
	}

	destroyed() {
		this.destroyLightbox();
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

	clearActiveItem() {
		this.activeItem = null;
		this.activeIndex = null;
		this.trackEvent('close');
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

	private trackEvent(action: string, label?: string) {
		Analytics.trackEvent('media-bar', action, label);
	}
}
