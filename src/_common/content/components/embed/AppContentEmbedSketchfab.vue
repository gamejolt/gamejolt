<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps({
	modelId: {
		type: String,
		required: true,
	},
});

const embedSrc = computed(() => `https://sketchfab.com/models/${props.modelId}/embed?camera=0`);
</script>

<template>
	<iframe
		width="100%"
		height="400px"
		scrolling="no"
		frameborder="no"
		allow="autoplay; fullscreen; vr"
		mozallowfullscreen="true"
		webkitallowfullscreen="true"
		sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
		:src="embedSrc"
	/>
</template>
