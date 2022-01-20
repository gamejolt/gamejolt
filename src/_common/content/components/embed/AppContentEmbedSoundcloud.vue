<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps({
	trackId: {
		type: String,
		required: true,
	},
});

const embedSrc = computed(
	() =>
		'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' +
		props.trackId +
		'&amp;color=2f7f6f'
);
</script>

<template>
	<iframe
		nwdisable
		nwfaketop
		width="100%"
		height="166"
		scrolling="no"
		frameborder="no"
		:src="embedSrc"
	/>
</template>
