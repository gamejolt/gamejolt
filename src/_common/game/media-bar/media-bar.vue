<script lang="ts">
import { computed, nextTick } from 'vue';
import { setup } from 'vue-class-component';
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { Analytics } from '../../analytics/analytics.service';
import { showErrorGrowl } from '../../growls/growls.service';
import AppLightboxItem from '../../lightbox/item/item.vue';
import { createLightbox } from '../../lightbox/lightbox-helpers';
import AppLoading from '../../loading/AppLoading.vue';
import AppScrollScroller from '../../scroll/AppScrollScroller.vue';
import AppGameMediaBarItem, { MediaBarItemMaxHeight } from './item/item.vue';

@Options({
	components: {
		AppLoading,
		AppLightboxItem,
		AppScrollScroller,
		AppGameMediaBarItem,
	},
})
export default class AppGameMediaBar extends Vue {
	@Prop(Array) mediaItems!: any[];

	private urlChecked = false;

	mediaBarHeight = MediaBarItemMaxHeight + 40;

	lightbox = setup(() => {
		return createLightbox(computed(() => (this.$props as this).mediaItems));
	});

	get activeItem() {
		if (!this.lightbox.isShowing) {
			return null;
		}
		return this.lightbox.activeItem;
	}

	@Watch('activeItem')
	activeItemChange() {
		let hash = '';
		if (this.activeItem) {
			const type = this.activeItem.getMediaType();

			if (type === 'image') {
				hash = '#screenshot-';
			} else if (type === 'video') {
				hash = '#video-';
			} else if (type === 'sketchfab') {
				hash = '#sketchfab-';
			}
			hash += this.activeItem.getModelId();
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

	setActiveItem(item: any) {
		let index = item;
		if (typeof item === 'object') {
			index = this.mediaItems.findIndex(_item => _item.id === item.id);
		}

		this.go(index);
		this.trackEvent('item-click', index);
	}

	go(index: number) {
		if (this.lightbox.isShowing) {
			this.lightbox.gotoPage(index);
		} else {
			this.lightbox.show(index);
		}
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
						showErrorGrowl(
							this.$gettext(
								`We couldn't find the image that was linked. It may have been removed.`
							),
							this.$gettext(`Invalid Image URL`)
						);
					} else if (type === 'video') {
						showErrorGrowl(
							this.$gettext(
								`We couldn't find the video that was linked. It may have been removed.`
							),
							this.$gettext(`Invalid Video URL`)
						);
					} else if (type === 'sketchfab') {
						showErrorGrowl(
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

	private trackEvent(action: string, label?: string) {
		Analytics.trackEvent('media-bar', action, label);
	}
}
</script>

<template>
	<AppScrollScroller class="media-bar fill-darker" horizontal thin>
		<div class="-items" :style="{ height: mediaBarHeight + 'px' }">
			<div v-if="!mediaItems || !mediaItems.length" class="-loading-container">
				<AppLoading centered no-color stationary hide-label />
			</div>

			<div v-if="mediaItems && mediaItems.length">
				<AppGameMediaBarItem
					v-for="item of mediaItems"
					:key="item.id"
					:item="item"
					@click="setActiveItem(item)"
				/>
			</div>
		</div>
	</AppScrollScroller>
</template>

<style lang="stylus" scoped>
.-loading-container
	position: absolute
	left: 0
	right: 0
	top: 50%

	.loading
		margin-top: -20px

.-items
	position: relative
	padding: 20px 0
	white-space: nowrap
	text-align: center
</style>
