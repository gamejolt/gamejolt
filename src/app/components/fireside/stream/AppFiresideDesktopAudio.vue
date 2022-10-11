<script lang="ts" setup>
import { onBeforeUnmount, onMounted, PropType, toRefs } from 'vue';
import {
	FiresideRTCUser,
	startDesktopAudioPlayback,
	stopDesktopAudioPlayback,
} from '../../../../_common/fireside/rtc/user';
import { useFiresideController } from '../controller/controller';

const props = defineProps({
	rtcUser: {
		type: Object as PropType<FiresideRTCUser>,
		required: true,
	},
});

const { rtcUser } = toRefs(props);
const { rtc } = useFiresideController()!;

onMounted(async () => {
	// Don't play desktop audio for our own local user.
	if (!rtc.value || rtc.value.isFocusingMe) {
		return;
	}

	// Don't play if the user is currently muted.
	if (rtcUser.value.remoteDesktopAudioMuted) {
		return;
	}

	await startDesktopAudioPlayback(rtcUser.value);
});

onBeforeUnmount(() => {
	stopDesktopAudioPlayback(rtcUser.value);
});
</script>

<template>
	<div class="-desktop-audio" />
</template>

<style lang="stylus" scoped>
.-desktop-audio
	display: none
</style>
