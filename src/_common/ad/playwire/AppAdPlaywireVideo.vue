<script lang="ts" setup>
import { onMounted, PropType, ref } from 'vue';
import { AdSlot } from '../ad-slot-info';
import { AdPlaywireAdapter } from './playwire-adapter';

defineProps({
	adSlot: {
		type: Object as PropType<AdSlot>,
		required: true,
	},
	adapter: {
		type: Object as PropType<AdPlaywireAdapter>,
		required: true,
	},
});

const root = ref<HTMLElement>();

onMounted(() => {
	const script = window.document.createElement('script');
	script.dataset.config = 'https://config.playwire.com/1391/playlists/v2/4898/zeus.json';

	root.value!.appendChild(script);
	script.src = 'https://cdn.playwire.com/bolt/js/zeus/embed.js';
});
</script>

<template>
	<div ref="root" />
</template>
