<script lang="ts" setup>
import { computed } from 'vue';

type Props = {
	modelId: string;
};
const { modelId } = defineProps<Props>();

const embedSrc = computed(() => `https://sketchfab.com/models/${modelId}/embed?camera=0`);
</script>

<template>
	<iframe
		width="100%"
		height="400px"
		scrolling="no"
		frameborder="no"
		allow="autoplay; fullscreen; vr"
		allowfullscreen="true"
		sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
		:src="embedSrc"
	/>
</template>
