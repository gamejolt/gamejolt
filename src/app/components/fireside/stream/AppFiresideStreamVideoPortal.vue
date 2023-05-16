<script lang="ts" setup>
import { onBeforeUnmount, onMounted, PropType, ref, toRefs } from 'vue';
import {
	FiresideHost,
	FiresideVideoFit,
	FiresideVideoLock,
	FiresideVideoQuality,
	getVideoLock,
	releaseVideoLock,
} from '../../../../_common/fireside/rtc/host';
import { useFiresideController } from '../controller/controller';

const props = defineProps({
	rtcUser: {
		type: Object as PropType<FiresideHost>,
		required: true,
	},
	quality: {
		type: String as PropType<FiresideVideoQuality>,
		default: 'high',
	},
	videoFit: {
		type: String as PropType<FiresideVideoFit>,
		default: 'contain',
	},
});

const { rtcUser, quality, videoFit } = toRefs(props);
const { rtc, isFullscreen } = useFiresideController()!;

let _videoLock: FiresideVideoLock | null = null;

const outputElem = ref<HTMLDivElement>();
// const canvasElem = ref<HTMLCanvasElement>();

// const cachedRatio = ref(16 / 9);

// const wrapperSize = ref({
// 	width: 1280,
// 	height: 720,
// });

// const canvasStyle = computed(() => {
// 	if (!isFullscreen.value) {
// 		return {
// 			width: '100%',
// 			height: '100%',
// 		};
// 	}

// 	const videoRatio = cachedRatio.value;
// 	const { width, height } = Screen;

// 	const screenRatio = width / height;
// 	const screenIsWider = screenRatio >= videoRatio;

// 	if (screenIsWider) {
// 		return {
// 			width: ((videoRatio * height) / width) * 100 + '%',
// 			height: '100%',
// 			left: '50%',
// 			transform: 'translateX(-50%)',
// 		};
// 	}

// 	return {
// 		width: '100%',
// 		height: (width / videoRatio / height) * 100 + '%',
// 		top: '50%',
// 		transform: 'translateY(-50%)',
// 	};
// });

// const pausedFrameData = computed(() => {
// 	if (shouldPlayVideo.value) {
// 		return null;
// 	}
// 	return rtcUser.value.pausedFrameData;
// });

// const shouldPlayVideo = computed(() => rtc.value?.videoPaused !== true);

onMounted(async () => {
	// _onShouldPlayVideoChange();
	// _onFrameDataChange();
	// onVideoSizeChanged();

	_getLock();
});

onBeforeUnmount(() => {
	// rtcUser.value should still be the old focused user in before unmount lifecycle hook,
	// so it should be ok to call _releaseLocks here.
	_releaseLock();
});

// watch(pausedFrameData, _onFrameDataChange);
// watch(shouldPlayVideo, _onShouldPlayVideoChange);

function _getLock() {
	// Just in case this is called when we already have a lock, queue it up for
	// release before grabbing a new video lock.
	if (_videoLock) {
		_releaseLock();
	}

	_videoLock = getVideoLock(rtcUser.value, outputElem.value!, quality.value);
}

function _releaseLock() {
	releaseVideoLock(rtcUser.value, _videoLock!);
	_videoLock = null;

	// // We want to give a new lock some time to get acquired before shutting the
	// // stream down.
	// //
	// // Capture the current rtc user and video lock in case they change somehow
	// // (switching hosts, updates to listable hosts, _getLocks, etc)
	// const oldUser = rtcUser.value;
	// const lock = _videoLock;
	// _videoLock = null;

	// setTimeout(() => {
	// 	if (lock) {
	// 		releaseVideoLock(oldUser, lock);
	// 	}
	// }, 0);
}

// function _onFrameDataChange() {
// 	if (!pausedFrameData.value || !canvasElem.value) {
// 		return;
// 	}

// 	const { width, height } = pausedFrameData.value;

// 	canvasElem.value.width = width;
// 	canvasElem.value.height = height;
// 	const context = canvasElem.value.getContext('2d')!;
// 	context.clearRect(0, 0, width, height);
// 	context.putImageData(pausedFrameData.value, 0, 0, 0, 0, width, height);
// 	cachedRatio.value = rtcUser.value.videoAspectRatio;
// }

// function _onShouldPlayVideoChange() {
// 	if (shouldPlayVideo.value) {
// 		_getLock();
// 	} else {
// 		_releaseLock();
// 	}
// }

// function onVideoSizeChanged() {
// 	const { width, height } = Ruler.offset(videoElem.value!);
// 	wrapperSize.value = { width, height };
// }
</script>

<template>
	<div class="-stream-video">
		<div ref="outputElem" :class="{ '-bg-trans': isFullscreen }" />
		<!-- <canvas v-show="!shouldPlayVideo" ref="canvasElem" :style="canvasStyle" /> -->
	</div>
</template>

<style lang="stylus" scoped>
.-stream-video
	position: relative
	-webkit-transform: translateZ(0)

	&
	> *
		width: 100%
		height: 100%

	> *
		position: absolute

.-bg-trans::v-deep(> *)
	background-color: transparent !important
</style>
