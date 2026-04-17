<script lang="ts" setup>
import { computed } from 'vue';

type Props = {
	trackId?: string;
	color?: string;
};
const { trackId = '', color = '' } = defineProps<Props>();

const embedSrc = computed(() => {
	let src = 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' + trackId;

	if (color) {
		src += '&amp;color=' + color;
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
