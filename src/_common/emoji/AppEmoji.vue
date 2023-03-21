<script lang="ts">
import { computed, PropType, toRefs } from 'vue';
import { Emoji } from './emoji.model';

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
const props = defineProps({
	emoji: {
		type: [String, Object] as PropType<(typeof GJ_EMOJIS)[number] | Emoji>,
		required: true,
		validator: (val: any) => val instanceof Emoji || GJ_EMOJIS.includes(val),
	},
});

const { emoji } = toRefs(props);

// TODO(reactions) test this, get working for content viewer
const backgroundImage = computed(() => {
	if (typeof emoji.value === 'string') {
		return assetPaths[`./${emoji.value}.png`];
	}
	return emoji.value.img_url;
});
</script>

<template>
	<span
		:style="[
			'speak: none',
			{
				display: `inline-block`,
				width: `25px`,
				height: `25px`,
				verticalAlign: `middle`,
				lineHeight: 1,
				cursor: `default`,
				backgroundRepeat: `no-repeat`,
				imageRendering: `pixelated`,
				backgroundImage: `url('${backgroundImage}')`,
				backgroundPosition: `center center`,
				backgroundSize: `contain`,
			},
		]"
	/>
</template>
