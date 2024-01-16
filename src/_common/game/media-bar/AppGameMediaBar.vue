<script lang="ts" setup>
import { PropType, nextTick, onUpdated, ref, toRefs } from 'vue';
import { useRouter } from 'vue-router';
import { Analytics } from '../../analytics/analytics.service';
import { showErrorGrowl } from '../../growls/growls.service';
import { createLightbox } from '../../lightbox/lightbox-helpers';
import AppLoading from '../../loading/AppLoading.vue';
import AppScrollScroller from '../../scroll/AppScrollScroller.vue';
import { $gettext } from '../../translate/translate.service';
import { GameScreenshotModel } from '../screenshot/screenshot.model';
import { GameSketchfabModel } from '../sketchfab/sketchfab.model';
import { GameVideoModel } from '../video/video.model';
import AppGameMediaBarItem, { MediaBarItemMaxHeight } from './item/AppGameMediaBarItem.vue';

const props = defineProps({
	mediaItems: {
		type: Array as PropType<(GameScreenshotModel | GameVideoModel | GameSketchfabModel)[]>,
		required: true,
	},
});

const { mediaItems } = toRefs(props);
const router = useRouter();

const urlChecked = ref(false);
const mediaBarHeight = ref(MediaBarItemMaxHeight + 40);

const lightbox = createLightbox(mediaItems);

onUpdated(async () => {
	// It seems like since we were changing state in the updated event it
	// wasn't correctly seeing that the check URL updates the state. Using
	// next tick to fix this.
	if (typeof mediaItems.value !== 'undefined' && !urlChecked.value) {
		urlChecked.value = true;
		await nextTick();
		checkUrl();
	}
});

function setActiveItem(item: any) {
	let index = item;
	if (typeof item === 'object') {
		index = mediaItems.value.findIndex(_item => _item.id === item.id);
	}

	go(index);
	trackEvent('item-click', index);
}

function go(index: number) {
	if (lightbox.isShowing) {
		lightbox.gotoPage(index);
	} else {
		lightbox.show(index);
	}
	updateRouter();
}

function updateRouter() {
	let hash = '';
	if (lightbox.activeItem) {
		const type = lightbox.activeItem.getMediaType();

		if (type === 'image') {
			hash = '#screenshot-';
		} else if (type === 'video') {
			hash = '#video-';
		} else if (type === 'sketchfab') {
			hash = '#sketchfab-';
		}
		hash += lightbox.activeItem.getModelId();
	}

	if (router) {
		router.replace({ hash });
	}
}

function checkUrl() {
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
			const item = mediaItems.value.find(_item => _item.id === id);
			if (item) {
				setActiveItem(item);
				trackEvent('permalink');
			} else {
				if (type === 'image') {
					showErrorGrowl(
						$gettext(
							`We couldn't find the image that was linked. It may have been removed.`
						),
						$gettext(`Invalid Image URL`)
					);
				} else if (type === 'video') {
					showErrorGrowl(
						$gettext(
							`We couldn't find the video that was linked. It may have been removed.`
						),
						$gettext(`Invalid Video URL`)
					);
				} else if (type === 'sketchfab') {
					showErrorGrowl(
						$gettext(
							`We couldn't find the sketchfab model that was linked. It may have been removed.`
						),
						$gettext(`Invalid Sketchfab URL`)
					);
				}
				trackEvent('permalink-invalid');
			}
		}
	}
}

function trackEvent(action: string, label?: string) {
	Analytics.trackEvent('media-bar', action, label);
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
