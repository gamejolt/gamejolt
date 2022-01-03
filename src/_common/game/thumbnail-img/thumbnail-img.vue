<script lang="ts" setup>
import { computed, PropType, ref } from 'vue';
import { ContentFocus } from '../../content-focus/content-focus.service';
import { AppImgResponsive } from '../../img/responsive/responsive';
import AppMediaItemBackdrop from '../../media-item/backdrop/backdrop.vue';
import { Screen } from '../../screen/screen-service';
import { getVideoPlayerFromSources } from '../../video/player/controller';
import AppVideo from '../../video/video.vue';
import { Game } from '../game.model';

const props = defineProps({
	game: {
		type: Object as PropType<Game>,
		required: true,
	},
	hideMedia: {
		type: Boolean,
		default: false,
	},
	animate: {
		type: Boolean,
		default: false,
	},
});

const isThumbnailLoaded = ref(import.meta.env.SSR);

const mediaItem = computed(() => props.game.thumbnail_media_item);

const hasVideo = computed(
	() => mediaItem.value?.is_animated && Screen.isDesktop && !import.meta.env.SSR && props.animate
);

const shouldPlayVideo = computed(() => hasVideo.value && ContentFocus.hasFocus);

const videoController = computed(() => {
	if (!mediaItem.value) {
		return;
	}

	const sourcesPayload = {
		mp4: mediaItem.value.mediaserver_url_mp4,
		webm: mediaItem.value.mediaserver_url_webm,
	};
	return getVideoPlayerFromSources(sourcesPayload, 'gif', mediaItem.value.mediaserver_url);
});

function imgLoadChange(isLoaded: boolean) {
	isThumbnailLoaded.value = isLoaded;
}
</script>

<template>
	<div
		class="game-thumbnail-img"
		:class="{
			'-loaded': isThumbnailLoaded,
		}"
	>
		<div class="-inner">
			<AppMediaItemBackdrop :media-item="mediaItem" radius="lg">
				<app-jolticon class="-icon" icon="game" />

				<div v-if="mediaItem && !hideMedia" class="-media">
					<AppImgResponsive
						class="-img"
						:src="mediaItem.mediaserver_url"
						alt=""
						@imgloadchange="imgLoadChange"
					/>

					<AppVideo
						v-if="hasVideo && videoController"
						class="-video"
						:player="videoController"
						:should-play="shouldPlayVideo"
					/>
				</div>
			</AppMediaItemBackdrop>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.game-thumbnail-img
	rounded-corners-lg()
	change-bg('bg-offset')
	position: relative
	height: 0
	padding-top: 56.25% // HD 16:9
	overflow: hidden

.-inner
	position: absolute
	top: 0
	left: 0
	width: 100%
	height: 100%

.-icon
	color: white
	opacity: 0.4
	position: absolute
	font-size: 16px * 2
	left: 50%
	margin-left: -(@font-size / 2)
	top: @left
	margin-top: @margin-left

.-media
	opacity: 0
	transition: opacity 500ms
	width: 100%

	.-loaded &
		opacity: 1

.-img
.-video
	position: absolute !important
	top: 0
	left: 0
	display: block
	width: 100%
	height: 100%

.-img
	z-index: 1

.-video
	z-index: 2
</style>
