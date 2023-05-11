<script lang="ts" setup>
import { PropType, onBeforeUnmount, onMounted, ref } from 'vue';
import { FiresideRTCHost } from '../../../../../_common/fireside/rtc/host';
import AppFiresideStreamHostChatPlayer from './AppFiresideStreamHostChatPlayer.vue';
import AppFiresideStreamHostVideoPlayer from './AppFiresideStreamHostVideoPlayer.vue';

const props = defineProps({
	host: {
		type: Object as PropType<FiresideRTCHost>,
		required: true,
	},
});

// We want to freeze the user. If it changed out from under us ever, it would
// break everything.
//
// eslint-disable-next-line vue/no-setup-props-destructure
const host = props.host;

const videoStreamElem = ref<HTMLVideoElement>();

onMounted(() => {
	if (host.isLocal) {
		videoStreamElem.value!.srcObject = host._videoMediaStream!;
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
			!host.currentVideoLock
				? {
						display: `none`,
				  }
				: undefined
		"
	>
		<Teleport :to="host.currentVideoLock?.target" :disabled="!host.currentVideoLock">
			<div>
				<template v-if="host.isRemote">
					<AppFiresideStreamHostVideoPlayer :host="host" />
					<AppFiresideStreamHostChatPlayer :host="host" />
				</template>
				<template v-else>
					<video ref="videoStreamElem" autoplay muted />
				</template>
			</div>
		</Teleport>
	</div>
</template>
