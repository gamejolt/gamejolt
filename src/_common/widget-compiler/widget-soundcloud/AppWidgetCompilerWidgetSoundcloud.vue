<script lang="ts" setup>
import { ref, toRefs } from 'vue';

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
const embedSrc = ref('');

embedSrc.value =
	'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' + trackId.value;

if (color.value) {
	embedSrc.value += '&amp;color=' + color.value;
}
</script>

<template>
	<!--TODO(component-setup-refactor): Test this, changed to self closing tag-->
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
