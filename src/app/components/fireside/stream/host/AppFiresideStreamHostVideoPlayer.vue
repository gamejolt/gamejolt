<script lang="ts" setup>
import { PropType, computed, watchEffect } from 'vue';
import { FiresideRTCUser } from '../../../../../_common/fireside/rtc/user';
import { createFiresideStreamHostPlayer } from './player-controller';

const props = defineProps({
	rtcUser: {
		type: Object as PropType<FiresideRTCUser>,
		required: true,
	},
});

// We want to freeze these. If it changed out from under us ever, it would break
// everything.
//
// eslint-disable-next-line vue/no-setup-props-destructure
const { rtcUser } = props;
const { rtc } = rtcUser;

const { player, playerElem } = createFiresideStreamHostPlayer(rtcUser, 'video');

/**
 * Their desktop audio will be muted if they're not the focused user, or if it's
 * been specifically muted.
 */
const isDesktopAudioMuted = computed(
	() => rtc.focusedUser?.userId !== rtcUser.userId || !rtcUser.desktopAudioPlayState
);

/**
 * Video quality is determined by the current video lock.
 */
const videoQuality = computed(() => rtcUser.currentVideoLock?.quality);

watchEffect(() => {
	if (rtcUser.videoPlayState) {
		player.value?.play();
	} else {
		player.value?.stop();
	}
});

watchEffect(() => {
	player.value?.setMute(isDesktopAudioMuted.value);
});

watchEffect(() => {
	player.value?.setVolume(Math.round(rtcUser.desktopPlaybackVolumeLevel * 100));
});

watchEffect(() => {
	const _doQualityChange = (desiredQuality: 'Thumb' | 'Source') => {
		if (!player.value) {
			return;
		}

		rtc.log(`Setting video to "${desiredQuality}" version for user: `, rtcUser.userId);

		const qualityLevels = player.value.getQualityLevels();
		const quality = qualityLevels.find(i => i.label === desiredQuality);
		if (quality) {
			player.value.setCurrentQuality(quality.index);
		} else {
			rtc.logError(
				`Could not find "${desiredQuality}" video version for user: `,
				rtcUser.userId
			);
		}
	};

	if (videoQuality.value === 'low') {
		_doQualityChange('Thumb');
	} else if (videoQuality.value === 'high') {
		_doQualityChange('Source');
	}
});
</script>

<template>
	<div ref="playerElem" />
</template>
