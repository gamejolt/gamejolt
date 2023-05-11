<script lang="ts" setup>
import { PropType, computed, watchEffect } from 'vue';
import { FiresideRTCHost } from '../../../../../_common/fireside/rtc/host';
import { createFiresideStreamHostPlayer } from './player-controller';

const props = defineProps({
	host: {
		type: Object as PropType<FiresideRTCHost>,
		required: true,
	},
});

// We want to freeze these. If it changed out from under us ever, it would break
// everything.
//
// eslint-disable-next-line vue/no-setup-props-destructure
const { host } = props;
const { rtc } = host;

const { player, playerElem } = createFiresideStreamHostPlayer(host, 'video');

/**
 * Their desktop audio will be muted if they're not the focused user, or if it's
 * been specifically muted.
 */
const isDesktopAudioMuted = computed(
	() => rtc.focusedUser?.userId !== host.userId || !host.desktopAudioPlayState
);

/**
 * Video quality is determined by the current video lock.
 */
const videoQuality = computed(() => host.currentVideoLock?.quality);

watchEffect(() => {
	if (host.videoPlayState) {
		player.value?.play();
	} else {
		player.value?.stop();
	}
});

watchEffect(() => {
	player.value?.setMute(isDesktopAudioMuted.value);
});

watchEffect(() => {
	player.value?.setVolume(Math.round(host.desktopPlaybackVolumeLevel * 100));
});

watchEffect(() => {
	const _doQualityChange = (desiredQuality: 'Thumb' | 'Source') => {
		if (!player.value) {
			return;
		}

		rtc.log(`Setting video to "${desiredQuality}" version for user: `, host.userId);

		const qualityLevels = player.value.getQualityLevels();
		const quality = qualityLevels.find(i => i.label === desiredQuality);
		if (quality) {
			player.value.setCurrentQuality(quality.index);
		} else {
			rtc.logError(
				`Could not find "${desiredQuality}" video version for user: `,
				host.userId
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
