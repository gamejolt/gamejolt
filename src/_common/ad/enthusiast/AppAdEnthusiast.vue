<script lang="ts" setup>
import { onMounted, ref, toRefs } from 'vue';
import { defineAdAdapterComponentProps } from '../adapter-base';
import { AdEnthusiastAdapter } from './enthusiast-adapter';

const props = defineProps({
	...defineAdAdapterComponentProps<AdEnthusiastAdapter>(),
});

const { size } = toRefs(props.adSlot);

// Can't change.
// eslint-disable-next-line vue/no-setup-props-destructure
const adapter = props.adapter;

const el = ref<HTMLDivElement>();

onMounted(() => {
	// We do it manually like this since the ad code actually modifies the
	// element. I don't want vue realizing the element changed and then trying
	// to rebind to it and overwriting things.
	const node = document.createElement('div');
	if (size.value === 'leaderboard') {
		node.id = 'div-gpt-ad-gjo-1';
	} else if (size.value === 'skyscraper-1') {
		node.id = 'div-gpt-ad-gjo-2';
	} else if (size.value === 'skyscraper-2') {
		node.id = 'div-gpt-ad-gjo-3';
	} else if (size.value === 'video') {
		node.className = 'eg-video-player';
	} else {
		node.className = 'eg-dyn-medrec proper-ad-unit';
	}

	el.value!.appendChild(node);

	adapter.ensureLoaded();
});
</script>

<template>
	<div ref="el" />
</template>
