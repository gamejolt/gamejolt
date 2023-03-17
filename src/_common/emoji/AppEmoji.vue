<script lang="ts">
export const GJ_EMOJIS = [
	'bucktooth',
	'crossed',
	'crying',
	'dizzy',
	'grin',
	'guh',
	'huh',
	'innocent',
	'mah',
	'ninja',
	'ohyou',
	'omg',
	'ouch',
	'psychotic',
	'sleeping',
	'smile',
	'snooty',
	'tongue',
	'wha',
	'yush',
] as const;

const assetPaths = import.meta.glob('./*.png', { eager: true, as: 'url' });
</script>

<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';

const props = defineProps({
	emoji: {
		type: String as PropType<(typeof GJ_EMOJIS)[number]>,
		required: true,
		validator: (val: any) => GJ_EMOJIS.includes(val),
	},
	/**
	 * Used for network emojis.
	 */
	src: {
		type: String,
		default: undefined,
	},
});

const { emoji, src } = toRefs(props);

// TODO(reactions) test this, get working for content viewer
const backgroundImage = computed(() => src?.value || assetPaths[`./${emoji.value}.png`]);
</script>

<template>
	<span class="emoji" :style="{ backgroundImage: `url('${backgroundImage}')` }" />
</template>

<style lang="stylus" scoped>
.emoji
	display: inline-block
	width: 25px
	height: 20px
	vertical-align: middle
	line-height: 1
	speak: none
	cursor: default
	background-repeat: no-repeat
	image-rendering: pixelated

	&._network
		height: auto
		max-height: 25px
</style>
