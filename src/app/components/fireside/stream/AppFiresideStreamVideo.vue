<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, PropType, ref, toRefs, watch } from 'vue';
import {
	FiresideRTCUser,
	FiresideVideoFit,
	FiresideVideoLock,
	FiresideVideoPlayStatePlaying,
	getVideoLock,
	releaseVideoLock,
	setVideoPlayback,
} from '../../../../_common/fireside/rtc/user';
import { Ruler } from '../../../../_common/ruler/ruler-service';
import { Screen } from '../../../../_common/screen/screen-service';
import { useFiresideController } from '../controller/controller';

const props = defineProps({
	rtcUser: {
		type: Object as PropType<FiresideRTCUser>,
		required: true,
	},
	lowBitrate: {
		type: Boolean,
	},
	videoFit: {
		type: String as PropType<FiresideVideoFit>,
		default: 'contain',
	},
});

const { rtcUser, lowBitrate, videoFit } = toRefs(props);
const { rtc, isFullscreen, isReconnecting } = useFiresideController()!;

let _videoLock: FiresideVideoLock | null = null;

const videoElem = ref<HTMLDivElement>();
const canvasElem = ref<HTMLCanvasElement>();

const cachedRatio = ref(16 / 9);

const wrapperSize = ref({
	width: 1280,
	height: 720,
});

const canvasStyle = computed(() => {
	if (!isFullscreen.value) {
		return {
			width: '100%',
			height: '100%',
		};
	}

	const videoRatio = cachedRatio.value;
	const { width, height } = Screen;

	const screenRatio = width / height;
	const screenIsWider = screenRatio >= videoRatio;

	if (screenIsWider) {
		return {
			width: ((videoRatio * height) / width) * 100 + '%',
			height: '100%',
			left: '50%',
			transform: 'translateX(-50%)',
		};
	}

	return {
		width: '100%',
		height: (width / videoRatio / height) * 100 + '%',
		top: '50%',
		transform: 'translateY(-50%)',
	};
});

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
	onVideoSizeChanged();
});

onBeforeUnmount(() => {
	// rtcUser.value should still be the old focused user in before unmount lifecycle hook,
	// so it should be ok to call _releaseLocks here.
	_releaseLocks();
});

watch(pausedFrameData, _onFrameDataChange);
watch([shouldPlayVideo, isReconnecting], _onShouldPlayVideoChange);

function _getLocks() {
	// Just in case this is called when we already have a lock, queue it up for
	// release before grabbing a new video lock.
	if (_videoLock) {
		_releaseLocks();
	}

	_videoLock = getVideoLock(rtcUser.value);
	setVideoPlayback(
		rtcUser.value,
		new FiresideVideoPlayStatePlaying(videoElem.value!, lowBitrate.value, videoFit.value)
	);
}

function _releaseLocks() {
	// We want to give a new lock some time to get acquired before shutting the
	// stream down.
	//
	// Capture the current rtc user and video lock in case they change somehow
	// (switching hosts, updates to listable hosts, _getLocks, etc)
	const oldUser = rtcUser.value;
	const lock = _videoLock;
	_videoLock = null;

	setTimeout(() => {
		if (lock) {
			releaseVideoLock(oldUser, lock);
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
	cachedRatio.value = rtcUser.value.videoAspectRatio;
}

function _onShouldPlayVideoChange() {
	// Ignore changes to this when we're reconnecting. If we're establishing
	// locks, we want to make sure we do it while we're actually connected.
	if (isReconnecting.value) {
		return;
	}

	if (shouldPlayVideo.value) {
		_getLocks();
	} else {
		_releaseLocks();
	}
}

function onVideoSizeChanged() {
	const { width, height } = Ruler.offset(videoElem.value!);
	wrapperSize.value = { width, height };
}
</script>

<template>
	<div class="-stream-video">
		<div ref="videoElem" :class="{ '-bg-trans': isFullscreen }" />
		<canvas v-show="!shouldPlayVideo" ref="canvasElem" :style="canvasStyle" />
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
