<script lang="ts">
import { computed, toRefs } from 'vue';

import { EmojiModel } from '~common/emoji/emoji.model';
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
		class="inline-block h-auto min-h-[20px] align-middle leading-none [speak:none]"
		:class="{ '[image-rendering:pixelated]': typeof emoji === 'string' }"
		:style="{
			width: emojiBaseSize.px,
			maxHeight: emojiBaseSize.px,
		}"
		:src="src"
		:alt="GJ_IS_MOBILE_APP ? undefined : ''"
	/>
</template>
