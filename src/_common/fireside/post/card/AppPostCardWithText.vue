<script lang="ts">
import { computed, nextTick, onMounted, PropType, ref, toRefs, useSlots, watch } from 'vue';
import { PostOpenSource } from '../../../analytics/analytics.service';
import { ContentFocus } from '../../../content-focus/content-focus.service';
import { Environment } from '../../../environment/environment.service';
import { MediaItem } from '../../../media-item/media-item-model';
import { Screen } from '../../../screen/screen-service';
import { ScrollInviewConfig } from '../../../scroll/inview/AppScrollInview.vue';
import {
	createVideoPlayerController,
	getVideoPlayerFromSources,
	VideoPlayerController,
	VideoPlayerControllerContext,
} from '../../../video/player/controller';
import { FiresidePost } from '../post-model';
import AppPostCard from './AppPostCard.vue';

export const AppPostCardAspectRatio = 10 / 16;

const InviewConfig = new ScrollInviewConfig({ margin: `${Screen.height}px` });
</script>

<script lang="ts" setup>
const props = defineProps({
	post: {
		type: Object as PropType<FiresidePost>,
		required: true,
	},
	source: {
		type: String as PropType<PostOpenSource>,
		required: true,
	},
	videoContext: {
		type: String as PropType<VideoPlayerControllerContext>,
		default: undefined,
	},
	withUser: {
		type: Boolean,
	},
});

const { post, source, videoContext, withUser } = toRefs(props);
const slots = useSlots();

const root = ref<HTMLElement>();
const cardElem = ref<HTMLElement>();

const videoController = ref<VideoPlayerController>();

const isImageThinner = ref(false);
const isVideoThinner = ref(false);

const cardWidth = ref('100%');
const cardHeight = ref('100%');
const imageWidth = ref('100%');
const imageHeight = ref('100%');
const videoWidth = ref('100%');
const videoHeight = ref('100%');
const leadHeight = ref(0);

const isBootstrapped = ref(import.meta.env.SSR);
const isHydrated = ref(import.meta.env.SSR);

const hasOverlayContent = computed(() => !!slots.overlay);
const shouldPlayVideo = computed(() => isHydrated.value && ContentFocus.hasFocus);

onMounted(() => calcData());

watch(shouldPlayVideo, _initVideoController);

const mediaItem = computed(() => {
	if (post.value?.hasMedia) {
		return post.value.media[0];
	} else if (post.value?.hasVideo) {
		return post.value.videos[0].posterMediaItem;
	}
	return undefined;
});

const video = computed(() => {
	if (!post.value?.hasVideo) {
		return undefined;
	}

	return post.value?.videos[0].media.find(i => i.type == MediaItem.TYPE_TRANSCODED_VIDEO_CARD);
});

const votedOnPoll = computed(() => {
	const poll = post.value?.poll;
	for (let i = 0; i < (poll?.items.length ?? 0); i++) {
		if (poll?.items[i].is_voted) {
			return true;
		}
	}
	return false;
});

const likedPost = computed(() => {
	if (post.value?.user_like) {
		return true;
	}
	return false;
});

const userLink = computed(() => Environment.wttfBaseUrl + post.value?.user.url);

async function calcData() {
	// Safari browsers don't always get the right initial dimensions if we don't do
	await nextTick();

	if (!root.value) {
		return;
	}

	const newCardWidth = root.value.offsetWidth;
	const newCardHeight = root.value.offsetHeight ?? newCardWidth / AppPostCardAspectRatio;
	const cardRatio = newCardWidth / newCardHeight;

	cardWidth.value = newCardWidth + 'px';
	cardHeight.value = newCardHeight + 'px';

	// Add in some space for the details on the bottom.
	leadHeight.value = newCardHeight - 40;

	const media = mediaItem.value;
	if (!media) {
		return;
	}

	const mediaWidth = media.croppedWidth;
	const mediaHeight = media.croppedHeight;
	const mediaRatio = mediaWidth / mediaHeight;
	isImageThinner.value = mediaRatio < cardRatio;

	if (video.value) {
		const videoWidth = video.value.croppedWidth;
		const videoHeight = video.value.croppedHeight;
		const videoRatio = videoWidth / videoHeight;

		isVideoThinner.value = videoRatio < cardRatio;
	}

	const posterRatio = media.croppedWidth / media.croppedHeight;
	const videoRatio = video.value
		? video.value.croppedWidth / video.value.croppedHeight
		: posterRatio;

	let width;
	let height;

	let newVideoWidth;
	let newVideoHeight;

	if (isImageThinner.value) {
		width = newCardWidth;
		height = width / posterRatio;
	} else {
		height = newCardHeight;
		width = height * posterRatio;
	}

	if (isVideoThinner.value) {
		newVideoWidth = newCardWidth;
		newVideoHeight = newVideoWidth / videoRatio;
	} else {
		newVideoHeight = newCardHeight;
		newVideoWidth = newVideoHeight * videoRatio;
	}

	imageWidth.value = width + 'px';
	imageHeight.value = height + 'px';
	videoWidth.value = newVideoWidth + 'px';
	videoHeight.value = newVideoHeight + 'px';
}

function inView() {
	isBootstrapped.value = true;
	isHydrated.value = true;
}

function outView() {
	isHydrated.value = false;
}

function _initVideoController() {
	if (!videoContext?.value || videoController.value) {
		return;
	}

	if (post.value?.hasVideo && post.value.videos[0].postCardVideo) {
		videoController.value = createVideoPlayerController(
			post.value.videos[0].postCardVideo,
			videoContext.value
		);

		videoController.value.volume = 0;
		videoController.value.muted = true;
	} else if (mediaItem.value?.is_animated) {
		const sourcesPayload = {
			mp4: mediaItem.value.mediaserver_url_mp4,
			webm: mediaItem.value.mediaserver_url_webm,
		};

		videoController.value = getVideoPlayerFromSources(sourcesPayload, 'gif');
	}
}
</script>

<template>
	<div class="-container">
		<div class="-card">
			<AppPostCard
				:post="post"
				:source="source"
				:video-context="videoContext"
				:with-user="withUser"
			/>
		</div>
		<div class="-text"></div>
	</div>
</template>

<style lang="stylus" scoped>
@import './common'

.-text
	::v-deep(.fireside-post-lead-content)
		font-size: ceil($font-size-base * 1.1)
</style>
