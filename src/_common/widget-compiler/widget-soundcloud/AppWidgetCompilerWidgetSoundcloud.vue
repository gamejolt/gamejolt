<script lang="ts" setup>
import { computed, toRefs } from 'vue';

const props = defineProps({
	trackId: {
		type: String,
		default: '',
	},
	color: {
		type: String,
		default: '',
	},
});

const { trackId, color } = toRefs(props);

const embedSrc = computed(() => {
	let src =
		'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' + trackId.value;

	if (color.value) {
		src += '&amp;color=' + color.value;
	}

	return src;
});
</script>

<template>
	<iframe
		class="widget-compiler-widget-soundcloud"
		nwdisable
		nwfaketop
		width="100%"
		height="166"
		scrolling="no"
		frameborder="no"
		:src="embedSrc"
	/>
</template>

<style lang="stylus" scoped>
.widget-compiler-widget-soundcloud
	display: block
	margin-bottom: $line-height-computed
</style>
