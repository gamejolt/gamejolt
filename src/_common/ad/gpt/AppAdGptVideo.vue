<script lang="ts" setup>
import { onMounted, onUnmounted, ref, toValue, useTemplateRef } from 'vue';
import { kBorderRadiusBase } from '../../../_styles/variables';
import { createLogger } from '../../../utils/logging';
import { onScreenResize } from '../../screen/screen-service';
import { useEventSubscription } from '../../system/event/event-topic';
import { loadVideoAdsTag, useAdStore } from '../ad-store';

const emit = defineEmits<{
	fail: [];
	done: [];
}>();

const videoRef = useTemplateRef('video');
const adContainerRef = useTemplateRef('ad-container');

const adsStore = useAdStore();

const logger = createLogger('Video Ads');

const isPlaying = ref(false);
const timeRemaining = ref(0);

let adDisplayContainer: google.ima.AdDisplayContainer | null = null;
let adsLoader: google.ima.AdsLoader | null = null;
let adsManager: google.ima.AdsManager | null = null;

let countdownTimer: NodeJS.Timer | null = null;

let autoplayRequiresMuted = false;

onMounted(async () => {
	if (!adContainerRef.value || !videoRef.value) {
		return;
	}

	try {
		await loadVideoAdsTag(adsStore);
	} catch (e) {
		logger.error('Failed to load video ads tag:', e);
		emit('fail');
		return;
	}

	adDisplayContainer = new google.ima.AdDisplayContainer(adContainerRef.value);
	adsLoader = new google.ima.AdsLoader(adDisplayContainer);

	adsLoader.addEventListener(
		google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
		onAdsManagerLoaded,
		false
	);

	adsLoader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError, false);

	// Check if autoplay is supported.
	checkAutoplaySupport();
});

/**
 * Attempts autoplay and handles success and failure cases.
 */
async function checkAutoplaySupport() {
	const video = toValue(videoRef);
	if (!video) {
		return;
	}

	// Test for autoplay support with our content player.
	try {
		await video.play();

		// If we make it here, unmuted autoplay works.
		onAutoplaySuccess({ video, requiresMuted: false });
	} catch (_e) {
		logger.info('Unmuted autoplay failed. Trying muted autoplay.');

		// Unmuted autoplay failed. Now try muted autoplay.
		checkMutedAutoplaySupport();
	}
}

/**
 * Checks if video can autoplay while muted.
 */
async function checkMutedAutoplaySupport() {
	const video = toValue(videoRef);
	if (!video) {
		return;
	}

	video.volume = 0;
	video.muted = true;

	// Test for autoplay support with our content player.
	try {
		await video.play();

		// If we make it here, muted autoplay works but unmuted autoplay does not.
		onAutoplaySuccess({ video, requiresMuted: true });
	} catch (_e) {
		// Both muted and unmuted autoplay failed. Fall back to click to play.
		logger.info('Muted autoplay failed. Skipping.');
		emit('fail');
	}
}

function onAutoplaySuccess({
	video,
	requiresMuted,
}: {
	video: HTMLVideoElement;
	requiresMuted: boolean;
}) {
	logger.info('Autoplay succeeded.', { requiresMuted });
	video.pause();
	autoplayRequiresMuted = requiresMuted;
	autoplayChecksResolved();
}

/**
 * Builds an ad request and uses it to request ads.
 */
function autoplayChecksResolved() {
	if (!adsLoader) {
		return;
	}

	const adsRequest = new google.ima.AdsRequest();

	adsRequest.adTagUrl =
		'https://pubads.g.doubleclick.net/gampad/ads?iu=/22547266442/video&description_url=https%3A%2F%2Fgamejolt.com%2Fprivacy%2Fads&tfcd=0&npa=0&sz=400x300%7C640x480&gdfp_req=1&unviewed_position_start=1&output=vast&env=vp&impl=s&correlator=&vad_type=linear';

	adsRequest.linearAdSlotWidth = videoRef.value?.clientWidth || 640;
	adsRequest.linearAdSlotHeight = videoRef.value?.clientHeight || 360;

	// If the autoplay checks completely failed, we'll emit failure and the ad
	// will be cleaned up. So ad will always autoplay.
	adsRequest.setAdWillAutoPlay(true);
	adsRequest.setAdWillPlayMuted(autoplayRequiresMuted);

	adsLoader.requestAds(adsRequest);
}

/**
 * This will get loaded when the ads are requested through the adsLoader.
 */
function onAdsManagerLoaded(event: google.ima.AdsManagerLoadedEvent) {
	const video = toValue(videoRef);
	if (!video || !adDisplayContainer) {
		return;
	}

	// Store the ads manager.
	adsManager = event.getAdsManager({ currentTime: 0 });

	// Mute the ad if doing muted autoplay.
	adsManager.setVolume(autoplayRequiresMuted ? 0 : 1);

	adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError);

	adsManager.addEventListener(google.ima.AdEvent.Type.STARTED, () => {
		isPlaying.value = true;

		countdownTimer = setInterval(() => {
			timeRemaining.value = adsManager?.getRemainingTime() || 0;
		}, 1000);
	});

	adsManager.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, () => {
		logger.info('All ads completed.');
		emit('done');
	});

	try {
		adDisplayContainer.initialize();
		adsManager.init(640, 360, google.ima.ViewMode.NORMAL);
		adsManager.start();
	} catch (adError) {
		logger.error('AdsManager initialization failed:', adError);
		emit('fail');
	}
}

function onAdError(adErrorEvent: google.ima.AdErrorEvent) {
	logger.error('Ad error:', adErrorEvent.getError());
	emit('fail');
}

onUnmounted(() => {
	adsManager?.destroy();
	adsManager = null;
	adDisplayContainer = null;
	adsLoader = null;

	if (countdownTimer) {
		clearInterval(countdownTimer);
		countdownTimer = null;
	}
});

useEventSubscription(onScreenResize, () => {
	if (!adsManager || !videoRef.value) {
		return;
	}

	const width = videoRef.value.clientWidth;
	const height = videoRef.value.clientHeight;
	adsManager.resize(width, height, google.ima.ViewMode.NORMAL);
});
</script>

<template>
	<div
		:style="{
			position: `relative`,
			width: `100%`,
			// 16/9 aspect ratio
			paddingBottom: `56.25%`,
		}"
	>
		<video
			ref="video"
			playsinline
			:style="{
				// We don't actually show any video. It's just for autoplay/dimension checks.
				visibility: `hidden`,
				position: `absolute`,
				top: 0,
				left: 0,
				width: `100%`,
				height: `100%`,
			}"
		>
			<source src="./dummy.mp4" type="video/mp4" />
		</video>
		<div
			ref="ad-container"
			:style="{
				position: `absolute`,
				top: 0,
				left: 0,
				width: `100%`,
			}"
		/>
		<div
			v-if="isPlaying"
			:style="{
				position: `absolute`,
				bottom: `8px`,
				left: `8px`,
				backgroundColor: `rgba(0, 0, 0, 0.7)`,
				color: `white`,
				padding: `4px 8px`,
				borderRadius: kBorderRadiusBase.px,
				pointerEvents: `none`,
			}"
		>
			Ad - {{ Math.ceil(timeRemaining) }} second(s) remaining
		</div>
	</div>
</template>
