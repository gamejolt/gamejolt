<script lang="ts" setup>
import { computed, onBeforeUnmount, Ref, ref, watch } from 'vue';

import { InviewConfigFocused } from '~app/components/activity/feed/view';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import { MediaItemModel } from '~common/media-item/media-item-model';
import AppScrollInview, { createScrollInview } from '~common/scroll/inview/AppScrollInview.vue';
import { SettingVideoPlayerFeedAutoplay } from '~common/settings/settings.service';
import { VideoSourceArray } from '~common/video/AppVideo.vue';
import AppVideoPlayer, {
	createDenseReadableTimestamp,
} from '~common/video/player/AppVideoPlayer.vue';
import {
	createVideoPlayerController,
	queueVideoTimeChange,
	VideoPlayerController,
} from '~common/video/player/controller';
import { styleBorderRadiusBase, styleOverlayTextShadow } from '~styles/mixins';
import { kFontSizeLarge, kFontSizeSmall } from '~styles/variables';

/**
 * How much time in ms to wait before loading the video player in once this item
 * becomes focused. We delay the load so if they're scrolling through the feed
 * fast we're not loading a ton video players in and slowing down the feed.
 */
const LoadDelay = 300;

type Props = {
	mediaItem: MediaItemModel;
	manifests: VideoSourceArray;
};
const { manifests } = defineProps<Props>();

const emit = defineEmits<{
	play: [];
	time: [timestamp: number];
}>();

const autoplay = ref(SettingVideoPlayerFeedAutoplay.get());
const player = ref() as Ref<VideoPlayerController | undefined>;
let previousTimestamp: number | undefined = undefined;

const shouldLoadVideo = ref(false);
const shouldLoadVideoTimer = ref(null) as Ref<NodeJS.Timer | null>;

const focusedController = createScrollInview();

const remainingTime = computed(() => {
	if (!player.value) {
		return null;
	}

	return createDenseReadableTimestamp(player.value.duration - player.value.currentTime);
});

function onPlaybackChanged() {
	if (!player.value) {
		return;
	}

	if (player.value.state === 'playing') {
		SettingVideoPlayerFeedAutoplay.set(true);
	} else {
		SettingVideoPlayerFeedAutoplay.set(false);
	}
}

watch(
	() => focusedController.isFocused,
	isFocused => {
		if (isFocused) {
			setVideoShouldLoadTimer();
		} else {
			clearVideoShouldLoadTimer();
			shouldLoadVideo.value = false;
		}
	}
);

onBeforeUnmount(() => {
	clearVideoShouldLoadTimer();
});

watch(
	() => focusedController.isFocused,
	isFocused => {
		if (isFocused) {
			setVideoShouldLoadTimer();
		} else {
			clearVideoShouldLoadTimer();
			shouldLoadVideo.value = false;
		}
	},
	{ immediate: true }
);

watch(shouldLoadVideo, shouldLoad => {
	if (shouldLoad) {
		player.value = createVideoPlayerController(manifests, 'feed');

		if (previousTimestamp) {
			queueVideoTimeChange(player.value, previousTimestamp);
			previousTimestamp = undefined;
		}

		autoplay.value = SettingVideoPlayerFeedAutoplay.get();
	} else {
		previousTimestamp = player.value?.currentTime;
		player.value = undefined;
	}
});

function clearVideoShouldLoadTimer() {
	if (shouldLoadVideoTimer.value) {
		clearTimeout(shouldLoadVideoTimer.value);
		shouldLoadVideoTimer.value = null;
	}
}

function setVideoShouldLoadTimer() {
	clearVideoShouldLoadTimer();
	shouldLoadVideoTimer.value = setTimeout(() => {
		shouldLoadVideo.value = true;
	}, LoadDelay);
}
</script>

<template>
	<AppScrollInview :config="InviewConfigFocused" :controller="focusedController">
		<AppVideoPlayer
			context="feed"
			:manifests="manifests"
			:media-item="mediaItem"
			:parent-player="player"
			use-parent-player
			:autoplay="autoplay"
			allow-degraded-autoplay
			@play="onPlaybackChanged"
			@pause="onPlaybackChanged"
			@time="emit('time', $event)"
			@click.stop
		>
			<template #controls-peek>
				<div
					v-if="player"
					:style="{
						marginLeft: `8px`,
						marginRight: `8px`,
						display: `flex`,
						alignItems: `center`,
						width: `100%`,
						height: `40px`,
					}"
				>
					<AppJolticon
						v-if="player.muted"
						icon="audio-mute"
						:style="{
							...styleOverlayTextShadow,
							fontSize: kFontSizeLarge.px,
							color: `white`,
							margin: 0,
						}"
					/>

					<div :style="{ flex: `1 0 12px` }" />

					<div
						v-if="player.duration"
						:style="{
							...styleBorderRadiusBase,
							backgroundColor: `rgba(0,0,0,0.4)`,
							color: `white`,
							padding: `4px 8px`,
							fontSize: kFontSizeSmall.px,
						}"
					>
						{{ remainingTime }}
					</div>
				</div>
			</template>
		</AppVideoPlayer>
	</AppScrollInview>
</template>
