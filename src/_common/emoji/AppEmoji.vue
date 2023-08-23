<script lang="ts">
import { computed, PropType, toRefs } from 'vue';
import { styleWhen } from '../../_styles/mixins';
import { CSSPixelValue } from '../../_styles/variables';
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

export const emojiBaseSize = new CSSPixelValue(24);

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

function isEmojiResource(emoji: typeof props.emoji): emoji is Emoji {
	if (typeof emoji === 'string') {
		return false;
	}
	return true;
}

const src = computed(() => {
	if (!isEmojiResource(emoji.value)) {
		return assetPaths[`./${emoji.value}.png`];
	}
	return emoji.value.img_url;
});
</script>

<template>
	<img
		:style="[
			'speak: none',
			{
				display: `inline-block`,
				width: emojiBaseSize.px,
				height: `auto`,
				minHeight: `20px`,
				maxHeight: emojiBaseSize.px,
				verticalAlign: `middle`,
				lineHeight: 1,
				cursor: `default`,
			},
			styleWhen(!isEmojiResource(emoji), {
				imageRendering: `pixelated`,
			}),
		]"
		:src="src"
		:alt="GJ_IS_MOBILE_APP ? undefined : ''"
	/>
</template>
