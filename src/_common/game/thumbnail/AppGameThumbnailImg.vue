<script lang="ts" setup>
import { computed, ref } from 'vue';

import AppAspectRatio from '~common/aspect-ratio/AppAspectRatio.vue';
import { useContentFocusService } from '~common/content-focus/content-focus.service';
import { GameModel } from '~common/game/game.model';
import AppImgResponsive from '~common/img/AppImgResponsive.vue';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import AppMediaItemBackdrop from '~common/media-item/backdrop/AppMediaItemBackdrop.vue';
import { getScreen } from '~common/screen/screen-service';
import AppVideo from '~common/video/AppVideo.vue';
import { getVideoPlayerFromSources } from '~common/video/player/controller';

type Props = {
	game: GameModel;
	hideMedia?: boolean;
	hideJolticon?: boolean;
	animate?: boolean;
	radius?: 'md' | 'lg' | 'sm';
};
const { game, hideMedia, hideJolticon, animate, radius = 'lg' } = defineProps<Props>();
const { hasContentFocus } = useContentFocusService();

const isThumbnailLoaded = ref(import.meta.env.SSR);

const mediaItem = computed(() => game.thumbnail_media_item);
const hasVideo = computed(
	() =>
		mediaItem.value?.is_animated &&
		getScreen().isDesktop.value &&
		!import.meta.env.SSR &&
		animate
);
const shouldPlayVideo = computed(() => hasVideo.value && hasContentFocus.value);
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
	<AppAspectRatio
		:class="{
			'-loaded': isThumbnailLoaded,
		}"
		:ratio="16 / 9"
	>
		<AppMediaItemBackdrop
			:media-item="mediaItem"
			:radius="radius"
			fallback-color="var(--theme-bg-offset)"
		>
			<AppJolticon v-if="!hideJolticon" class="-icon" icon="gamepad" />

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
	</AppAspectRatio>
</template>

<style lang="stylus" scoped>
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
