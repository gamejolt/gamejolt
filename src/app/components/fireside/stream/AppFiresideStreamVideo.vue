<script lang="ts" setup>
import { computed, onMounted, PropType, ref, toRefs, watch } from 'vue';
import {
	FiresideRTCUser,
	FiresideVideoLock,
	FiresideVideoPlayStatePlaying,
	getVideoLock,
	releaseVideoLock,
	setVideoPlayback,
} from '../../../../_common/fireside/rtc/user';
import { useFiresideController } from '../controller/controller';

const props = defineProps({
	rtcUser: {
		type: Object as PropType<FiresideRTCUser>,
		required: true,
	},
	lowBitrate: {
		type: Boolean,
	},
});

const { rtcUser, lowBitrate } = toRefs(props);
const { rtc } = useFiresideController()!;

let _videoLock: FiresideVideoLock | null = null;

const videoElem = ref<HTMLDivElement>();
const canvasElem = ref<HTMLCanvasElement>();

const pausedFrameData = computed(() => {
	if (shouldPlayVideo.value) {
		return null;
	}
	return rtcUser.value.pausedFrameData;
});

const shouldPlayVideo = computed(() => rtc.value?.videoPaused !== true);

onMounted(() => {
	_onShouldPlayVideoChange();
	_onFrameDataChange();
});

watch(pausedFrameData, _onFrameDataChange);
watch(shouldPlayVideo, _onShouldPlayVideoChange);

function _getLocks() {
	_videoLock = getVideoLock(rtcUser.value);
	setVideoPlayback(
		rtcUser.value,
		new FiresideVideoPlayStatePlaying(videoElem.value!, lowBitrate.value)
	);
}

function _releaseLocks() {
	// We want to give a new lock some time to get acquired before shutting
	// the stream down.
	setTimeout(() => {
		if (_videoLock) {
			releaseVideoLock(rtcUser.value, _videoLock);
		}
	}, 0);
}

function _onFrameDataChange() {
	if (!pausedFrameData.value || !canvasElem.value) {
		return;
	}

	const { width, height } = pausedFrameData.value;

	canvasElem.value.width = width;
	canvasElem.value.height = height;
	const context = canvasElem.value.getContext('2d')!;
	context.clearRect(0, 0, width, height);
	context.putImageData(pausedFrameData.value, 0, 0, 0, 0, width, height);
}

function _onShouldPlayVideoChange() {
	if (shouldPlayVideo.value) {
		_getLocks();
	} else {
		_releaseLocks();
	}
}
</script>

<template>
	<div class="-video-player">
		<div ref="videoElem" />
		<canvas v-show="!shouldPlayVideo" ref="canvasElem" />
	</div>
</template>

<style lang="stylus" scoped>
.-video-player
	position: relative

	&
	> *
		width: 100%
		height: 100%

	> *
		position: absolute
</style>
