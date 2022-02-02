<script lang="ts" setup>
import { computed, onMounted, PropType, ref, toRefs } from 'vue';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import AppImgResponsive from '../../../../../_common/img/AppImgResponsive.vue';
import {
	createVideoPlayerController,
	getVideoPlayerFromSources,
	VideoPlayerController,
} from '../../../../../_common/video/player/controller';
import AppVideo from '../../../../../_common/video/video.vue';

const props = defineProps({
	post: {
		type: Object as PropType<FiresidePost>,
		required: true,
	},
});

const emit = defineEmits({
	loaded: () => true,
});

const { post } = toRefs(props);

const videoController = ref(null as VideoPlayerController | null);
const imgLoaded = ref(false);

const mediaItem = computed(() => {
	if (post.value.hasVideo) {
		return post.value.videos[0].posterMediaItem!;
	}

	return post.value.media[0];
});

const video = computed(() => {
	if (!post.value.hasVideo) {
		return;
	}

	return post.value.videos[0];
});

onMounted(() => {
	if (video.value?.postCardVideo) {
		videoController.value = createVideoPlayerController(video.value.postCardVideo, null);

		videoController.value.volume = 0;
		videoController.value.muted = true;
	} else if (mediaItem.value?.is_animated) {
		videoController.value = getVideoPlayerFromSources(
			{
				mp4: mediaItem.value.mediaserver_url_mp4,
				webm: mediaItem.value.mediaserver_url_webm,
			},
			'gif'
		);
	}
});

function onImageLoad(isLoaded: boolean) {
	imgLoaded.value = isLoaded;

	if (isLoaded) {
		emit('loaded');
	}
}
</script>

<template>
	<div class="-fs-post">
		<div class="-backdrop">
			<AppImgResponsive
				class="-backdrop-img"
				:class="{
					'-loaded': imgLoaded,
				}"
				:src="mediaItem.mediaserver_url"
				alt=""
				@imgloadchange="onImageLoad"
			/>
		</div>

		<div class="-shade" />

		<template v-if="videoController">
			<AppVideo
				class="-video"
				:player="videoController"
				should-play
				allow-degraded-autoplay
			/>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.-fs-post
.-backdrop
.-shade
	position: absolute
	top: 0
	left: 0
	right: 0
	bottom: 0

.-backdrop-img
	position: relative
	width: 100%
	height: 100%
	object-fit: cover
	opacity: 0
	transition-duration: 1s

	&.-loaded
		opacity: 1

.-shade
	background-color: rgba(0, 0, 0, 0.5)

.-video
	position: relative
	width: 100%
	height: 100%

	::v-deep(> video)
		height: 100% !important
		width: 100% !important
		object-fit: cover
</style>
