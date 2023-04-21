<script lang="ts" setup>
import { PropType, onBeforeUnmount, onMounted, ref } from 'vue';
import { FiresideRTCUser } from '../../../../../_common/fireside/rtc/user';
import AppFiresideStreamHostChatPlayer from './AppFiresideStreamHostChatPlayer.vue';
import AppFiresideStreamHostVideoPlayer from './AppFiresideStreamHostVideoPlayer.vue';

const props = defineProps({
	rtcUser: {
		type: Object as PropType<FiresideRTCUser>,
		required: true,
	},
});

// We want to freeze the user. If it changed out from under us ever, it would
// break everything.
//
// eslint-disable-next-line vue/no-setup-props-destructure
const rtcUser = props.rtcUser;

const videoStreamElem = ref<HTMLVideoElement>();

onMounted(() => {
	if (rtcUser.isLocal) {
		videoStreamElem.value!.srcObject = rtcUser._videoMediaStream!;
	}
});

onBeforeUnmount(() => {
	if (videoStreamElem.value) {
		videoStreamElem.value.srcObject = null;
	}
});
</script>

<template>
	<!-- When we have no active portal, we want to hide the player -->
	<div
		:style="
			!rtcUser.currentVideoLock
				? {
						display: `none`,
				  }
				: undefined
		"
	>
		<Teleport :to="rtcUser.currentVideoLock?.target" :disabled="!rtcUser.currentVideoLock">
			<div>
				<template v-if="rtcUser.isRemote">
					<AppFiresideStreamHostVideoPlayer :rtc-user="rtcUser" />
					<AppFiresideStreamHostChatPlayer :rtc-user="rtcUser" />
				</template>
				<template v-else>
					<video ref="videoStreamElem" autoplay muted />
				</template>
			</div>
		</Teleport>
	</div>
</template>
