<script lang="ts" setup>
import { onBeforeUnmount, onMounted, PropType, toRefs } from 'vue';
import { FiresideRTCUser, setDesktopAudioPlayback } from '../../../../_common/fireside/rtc/user';
import { useFiresideController } from '../controller/controller';

const props = defineProps({
	rtcUser: {
		type: Object as PropType<FiresideRTCUser>,
		required: true,
	},
});

const { rtcUser } = toRefs(props);
const { rtc } = useFiresideController()!;

onMounted(() => {
	// Don't play desktop audio for our own local user.
	if (!rtc.value || rtc.value.isFocusingMe) {
		return;
	}

	// Don't play if the user is currently muted.
	if (rtcUser.value.remoteDesktopAudioMuted) {
		return;
	}

	setDesktopAudioPlayback(rtcUser.value, true);
});

onBeforeUnmount(() => {
	setDesktopAudioPlayback(rtcUser.value, false);
});
</script>

<template>
	<div class="-desktop-audio" />
</template>

<style lang="stylus" scoped>
.-desktop-audio
	display: none
</style>
