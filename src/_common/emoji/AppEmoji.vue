<script lang="ts">
import { computed, toRefs } from 'vue';

import { EmojiModel } from '~common/emoji/emoji.model';
import { styleWhen } from '~styles/mixins';
import { buildCSSPixelValue } from '~styles/variables';

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

export const emojiBaseSize = buildCSSPixelValue(24);

const assetPaths = import.meta.glob('./*.png', { eager: true, as: 'url' });
</script>

<script lang="ts" setup>
import { HTMLAttributes } from 'vue';

type Props = {
	emoji: (typeof GJ_EMOJIS)[number] | EmojiModel;
} & /* @vue-ignore */ Pick<HTMLAttributes, 'onClick' | 'onMouseenter'>;

const props = defineProps<Props>();

const { emoji } = toRefs(props);

const src = computed(() => {
	if (typeof emoji.value === 'string') {
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
			},
			styleWhen(typeof emoji === 'string', {
				imageRendering: `pixelated`,
			}),
		]"
		:src="src"
		:alt="GJ_IS_MOBILE_APP ? undefined : ''"
	/>
</template>
