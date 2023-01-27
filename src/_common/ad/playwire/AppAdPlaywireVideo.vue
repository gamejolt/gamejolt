<script lang="ts" setup>
import { onMounted, toRefs } from 'vue';
import { defineAdAdapterComponentProps } from '../adapter-base';
import { AdPlaywireAdapter } from './playwire-adapter';

const props = defineProps({
	...defineAdAdapterComponentProps<AdPlaywireAdapter>(),
});

const { adapter } = toRefs(props);

onMounted(() => {
	adapter.value.ensureLoaded();
});

// TODO: apparently they don't need anything set up in the slot?
// const root = ref<HTMLElement>();

// onMounted(() => {
// 	const script = window.document.createElement('script');
// 	script.dataset.config = 'https://config.playwire.com/1391/playlists/v2/4898/zeus.json';

// 	root.value!.appendChild(script);
// 	script.src = 'https://cdn.playwire.com/bolt/js/zeus/embed.js';
// });
</script>

<template>
	<div class="ad-playwire-video" />
</template>
