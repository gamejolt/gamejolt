<script lang="ts" setup>
import { PropType, computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { FiresideHost } from '../../../../../_common/fireside/rtc/host';
import { useFiresideController } from '../../controller/controller';
import AppFiresideStreamHostChatPlayer from './AppFiresideStreamHostChatPlayer.vue';
import AppFiresideStreamHostVideoPlayer from './AppFiresideStreamHostVideoPlayer.vue';

const props = defineProps({
	host: {
		type: Object as PropType<FiresideHost>,
		required: true,
	},
});

const { producer } = useFiresideController()!;

// We want to freeze the user. If it changed out from under us ever, it would
// break everything.
//
// eslint-disable-next-line vue/no-setup-props-destructure
const host = props.host;

const localVideoStreamElem = ref<HTMLVideoElement>();

/**
 * Whether this host is them and they're currently streaming in this client.
 */
const isLocallyStreaming = computed(() => host.isMe && producer.value?.isStreaming.value === true);

/**
 * Will return a MediaStream of their local video stream if this host is them,
 * and they are currently streaming in this tab.
 */
const localVideoStream = computed(
	() => (isLocallyStreaming.value && producer.value?.videoStream.value) || null
);

onMounted(() => {
	if (localVideoStream.value) {
		localVideoStreamElem.value!.srcObject = localVideoStream.value;
	}
});

onBeforeUnmount(() => {
	if (localVideoStreamElem.value) {
		localVideoStreamElem.value.srcObject = null;
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
				<template v-if="isLocallyStreaming">
					<!-- We only need to render out video streams. If they're only streaming audio, nothing will get rendered. -->
					<template v-if="localVideoStream">
						<video ref="localVideoStreamElem" autoplay muted />
					</template>
				</template>
				<template v-else>
					<AppFiresideStreamHostVideoPlayer v-if="host.hasVideo" :host="host" />
					<AppFiresideStreamHostChatPlayer v-if="host.hasMicAudio" :host="host" />
				</template>
			</div>
		</Teleport>
	</div>
</template>
