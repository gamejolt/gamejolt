<script lang="ts" setup>
import { onMounted, watch } from 'vue';
import '../../social.styl';
import { YoutubeSdk } from '../sdk/sdk.service';

type Props = {
	channel: string;
	layout?: string;
	theme?: string;
};
const { channel, layout = 'default', theme = 'default' } = defineProps<Props>();

function init() {
	YoutubeSdk.load();
}

onMounted(() => init());
watch([() => channel, () => layout, () => theme], () => init());
</script>

<template>
	<div class="social-youtube-subscribe">
		<div
			class="g-ytsubscribe"
			:data-channelid="channel"
			:data-layout="layout"
			:data-theme="theme"
			data-count="default"
		/>
	</div>
</template>
