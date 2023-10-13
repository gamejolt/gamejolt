<script lang="ts" setup>
import { PropType, computed, nextTick, onMounted, ref, toRefs, watch } from 'vue';
import { isInstance } from '../../../utils/utils';
import { GameSketchfabModel } from '../../game/sketchfab/sketchfab.model';
import { GameVideoModel } from '../../game/video/video.model';
import AppImgResponsive from '../../img/AppImgResponsive.vue';
import AppMediaItemBackdrop from '../../media-item/backdrop/AppMediaItemBackdrop.vue';
import { MediaItemModel } from '../../media-item/media-item-model';
import { Screen, onScreenResize } from '../../screen/screen-service';
import AppSketchfabEmbed from '../../sketchfab/embed/AppSketchfabEmbed.vue';
import { useEventSubscription } from '../../system/event/event-topic';
import AppVideo from '../../video/AppVideo.vue';
import AppVideoEmbed from '../../video/embed/AppVideoEmbed.vue';
import { getVideoPlayerFromSources } from '../../video/player/controller';
import { LightboxConfig, LightboxMediaModel } from '../lightbox-helpers';

const props = defineProps({
	item: {
		type: Object as PropType<LightboxMediaModel>,
		required: true,
	},
	itemIndex: {
		type: Number,
		required: true,
	},
	activeIndex: {
		type: Number,
		required: true,
	},
});

const { item, itemIndex, activeIndex } = toRefs(props);

const isActive = ref(false);
const isNext = ref(false);
const isPrev = ref(false);
const initialized = ref(false);
const maxWidth = ref(0);
const maxHeight = ref(0);
const caption = ref<HTMLDivElement>();
const rootElem = ref<HTMLDivElement>();

const shouldVideoPlay = computed(() => isActive.value);

const isGifWithoutVideo = computed(
	() =>
		mediaItem.value.is_animated &&
		!mediaItem.value.mediaserver_url_mp4 &&
		!mediaItem.value.mediaserver_url_webm
);

const mediaItem = computed(() => item.value.getMediaItem()!);

const videoController = computed(() => {
	const sources = {
		mp4: mediaItem.value.mediaserver_url_mp4,
		webm: mediaItem.value.mediaserver_url_webm,
	};
	return getVideoPlayerFromSources(sources, 'gif', mediaItem.value.mediaserver_url);
});

useEventSubscription(onScreenResize, () => calcDimensions());

watch(activeIndex, () => calcActive());

onMounted(async () => {
	await calcActive();
	await calcDimensions();

	initialized.value = true;
});

async function calcDimensions() {
	await nextTick();

	if (Screen.isXs) {
		return;
	}

	// Very fragile. Kinda lame.
	maxWidth.value = Screen.width - LightboxConfig.buttonSize * 2;
	maxHeight.value = Screen.height - LightboxConfig.controlsHeight * 2;

	if (caption.value) {
		maxHeight.value -= caption.value.offsetHeight;
	}

	if (item.value.getMediaType() === 'image') {
		const dimensions = item.value
			.getMediaItem()!
			.getDimensions(maxWidth.value, maxHeight.value);
		maxWidth.value = dimensions.width;
		maxHeight.value = dimensions.height;
	}
}

async function calcActive() {
	if (!rootElem.value) {
		return;
	}

	isActive.value = activeIndex.value === itemIndex.value;
	isNext.value = activeIndex.value + 1 === itemIndex.value;
	isPrev.value = activeIndex.value - 1 === itemIndex.value;

	rootElem.value.classList.remove('active', 'next', 'prev');

	if (isActive.value) {
		rootElem.value.classList.add('active');
	} else if (isPrev.value) {
		rootElem.value.classList.add('prev');
	} else if (isNext.value) {
		rootElem.value.classList.add('next');
	}

	if (isActive.value || isNext.value || isPrev.value) {
		calcDimensions();
	}
}
</script>

<template>
	<div ref="rootElem" class="media-bar-lightbox-item">
		<div v-if="isActive || isNext || isPrev" class="-inner">
			<!-- Image -->
			<template v-if="isInstance(item, MediaItemModel)">
				<div class="-embed">
					<!-- The min/max will be the actual dimensions for the image thumbnail. -->
					<AppMediaItemBackdrop
						:media-item="mediaItem"
						:style="{
							width: maxWidth ? maxWidth + 'px' : undefined,
							height: maxHeight ? maxHeight + 'px' : undefined,
							marginLeft: 'auto',
							marginRight: 'auto',
							maxWidth: `${mediaItem.width}px`,
						}"
						radius="lg"
					>
						<AppImgResponsive
							v-if="!mediaItem.is_animated || !shouldVideoPlay"
							class="-img"
							:src="item.img_thumbnail"
						/>
						<img
							v-else-if="isGifWithoutVideo"
							class="img-responsive"
							:src="mediaItem.img_url"
							alt=""
						/>
						<AppVideo
							v-else-if="videoController"
							class="-video"
							:player="videoController"
							show-loading
						/>
					</AppMediaItemBackdrop>
				</div>
			</template>

			<!-- Video mediaType === 'video'-->
			<template v-else-if="isInstance(item, GameVideoModel)">
				<div v-if="isActive" class="-embed">
					<!-- We want to wait until the size is properly calculated, otherwise the player won't size properly. -->
					<AppVideoEmbed
						v-if="initialized"
						:video-provider="item.type"
						:video-id="item.url"
						:max-video-width="maxWidth"
						:max-video-height="maxHeight"
						autoplay
					/>
				</div>

				<div v-if="item.title || item.description" ref="caption" class="-caption">
					<h4>{{ item.title }}</h4>
					<p v-if="item.description" v-text="item.description" />
				</div>
			</template>

			<!-- Sketchfab -->
			<template v-else-if="isInstance(item, GameSketchfabModel)">
				<div v-if="isActive" class="-embed">
					<AppSketchfabEmbed
						:sketchfab-id="item.sketchfab_id"
						:max-width="maxWidth"
						:max-height="maxHeight"
						:autoplay="true"
					/>
				</div>
			</template>
		</div>
	</div>
</template>

<style lang="stylus" src="./item.styl" scoped></style>
