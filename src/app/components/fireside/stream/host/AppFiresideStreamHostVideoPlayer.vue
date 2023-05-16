<script lang="ts" setup>
import { PropType, computed, watchEffect } from 'vue';
import { FiresideHost } from '../../../../../_common/fireside/rtc/host';
import { useFiresideController } from '../../controller/controller';
import { createFiresideStreamHostPlayer } from './player-controller';

const props = defineProps({
	host: {
		type: Object as PropType<FiresideHost>,
		required: true,
	},
});

// We want to freeze these. If it changed out from under us ever, it would break
// everything.
//
// eslint-disable-next-line vue/no-setup-props-destructure
const { host } = props;

const { focusedHost, logger } = useFiresideController()!;
const { player, playerElem } = createFiresideStreamHostPlayer({
	host,
	logger,
	playerType: 'video',
});

/**
 * Their desktop audio will be muted if they're not the focused user, or if it's
 * been specifically muted.
 */
const isDesktopAudioMuted = computed(
	() => focusedHost.value?.userId !== host.userId || !host.desktopAudioPlayState
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

		logger.info(`Setting video to "${desiredQuality}" version for user: `, host.userId);

		const qualityLevels = player.value.getQualityLevels();
		const quality = qualityLevels.find(i => i.label === desiredQuality);
		if (quality) {
			player.value.setCurrentQuality(quality.index);
		} else {
			logger.error(
				`Could not find "${desiredQuality}" video version for user: `,
				host.userId,
				qualityLevels
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
