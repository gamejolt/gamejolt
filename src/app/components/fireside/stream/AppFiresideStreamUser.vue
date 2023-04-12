<script lang="ts" setup>
import OvenPlayerStatic from 'ovenplayer';
import { PropType, computed, markRaw, onMounted, onUnmounted, ref } from 'vue';
import { FiresideRTCUser } from '../../../../_common/fireside/rtc/user';

const props = defineProps({
	rtcUser: {
		type: Object as PropType<FiresideRTCUser>,
		required: true,
	},
});

// const { rtc, fireside } = useFiresideController()!;

// We want to freeze the user. If it changed out from under us ever, it would
// break everything.

// eslint-disable-next-line vue/no-setup-props-destructure
const rtcUser = props.rtcUser;

const ovenPlayerElem = ref<HTMLDivElement>();
const videoStreamElem = ref<HTMLVideoElement>();

/**
 * The current place we want to render the player in is the latest video lock.
 */
const currentPortal = computed(() =>
	rtcUser.videoLocks.length > 0 ? rtcUser.videoLocks[rtcUser.videoLocks.length - 1].target : null
);

onMounted(() => {
	if (rtcUser.isRemote) {
		if (rtcUser._videoPlayer) {
			throw new Error(`Already have a video player for ${rtcUser.userId}!`);
		}

		const streamName = `${rtcUser.userId}`;

		rtcUser._videoPlayer = markRaw(
			OvenPlayerStatic.create(ovenPlayerElem.value!, {
				autoFallback: false,
				autoStart: true,
				sources: [
					{
						label: 'WebRTC',
						type: 'webrtc',
						file: `wss://oven.development.gamejolt.com:3334/app/${streamName}?transport=tcp`,
					},
				],
			})
		);

		// // Wait for next tick before playing so that any video playback elements
		// // are first deregistered.
		// await sleep(0);

		// rtcUser._videoPlayer.play();
	} else if (rtcUser.isLocal) {
		// videoElem.autoplay = true;
		videoStreamElem.value!.srcObject = rtcUser._videoMediaStream!;
	}
});

onUnmounted(() => {
	if (rtcUser.isRemote) {
		if (rtcUser._videoPlayer) {
			rtcUser._videoPlayer.remove();
			rtcUser._videoPlayer = null;
		}
	} else if (rtcUser.isLocal) {
		if (videoStreamElem.value) {
			videoStreamElem.value.srcObject = null;
		}
	}
});
</script>

<template>
	<!-- When we have no active portal, we want to hide the player -->
	<div
		:style="
			!currentPortal
				? {
						display: `none`,
				  }
				: undefined
		"
	>
		<Teleport :to="currentPortal" :disabled="!currentPortal">
			<div>
				<div ref="ovenPlayerElem" />
				<video ref="videoStreamElem" autoplay muted />
			</div>
		</Teleport>
	</div>
</template>
