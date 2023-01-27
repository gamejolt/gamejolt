<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import { defineAdAdapterComponentProps } from '../adapter-base';
import { AdPlaywireAdapter } from './playwire-adapter';

const props = defineProps({
	...defineAdAdapterComponentProps<AdPlaywireAdapter>(),
});

/**
 * This is a Playwire placement key and must match their system.
 */
const placement = computed(() => {
	const { size, meta } = props.adSlot;

	if (size === 'rectangle') {
		// We got Playwire to make it so that "btf" ads will never change size.
		// We can use this when there is content below it that we never want
		// being pushed around, such as feeds.
		const position = meta.staticSize ? 'btf' : 'atf';
		return `med_rect_${position}`;
	}

	// Footer is a special case ad that should show below all content, right
	// above the footer.
	if (size === 'footer') {
		return 'leaderboard_btf';
	}

	return 'leaderboard_atf';
});

onMounted(() => {
	props.adapter.ensureLoaded();
});
</script>

<template>
	<div>
		<div :data-pw-desk="placement" />
		<div :data-pw-mobi="placement" />
	</div>
</template>
