<script lang="ts" setup>
import { computed, HTMLAttributes } from 'vue';

import { ReactionCount } from '~common/reaction/reaction-count';
import { kThemeBacklight, kThemeBgActual, kThemeBgOffset } from '~common/theme/variables';
import { kBorderWidthLg, kFontSizeTiny } from '~styles/variables';

type Props = {
	reaction: ReactionCount;
	focusedId?: number;
	size?: number;
} & /* @vue-ignore */ Pick<HTMLAttributes, 'onClick' | 'onContextmenu'>;

const { reaction, focusedId, size = 20 } = defineProps<Props>();

const emojiId = computed(() => reaction.id);
const imgUrl = computed(() => reaction.img_url);
const didReact = computed(() => reaction.did_react === true);
const displayText = computed(() => reaction.count);

const shouldHighlight = computed(() => {
	if (focusedId) {
		return focusedId === emojiId.value;
	}
	return didReact.value;
});

const borderColor = computed(() => {
	if (focusedId || !shouldHighlight.value) {
		return 'transparent';
	}
	return kThemeBacklight;
});

const bgColor = computed(() => {
	const nonHighlightBg = focusedId ? kThemeBgActual : kThemeBgOffset;
	if (shouldHighlight.value) {
		return kThemeBgOffset;
	}
	return nonHighlightBg;
});
</script>

<template>
	<!-- AppReactionListItem -->
	<div
		class="rounded"
		:style="{
			backgroundColor: bgColor,
			display: `inline-flex`,
			alignItems: `center`,
			padding: `0px 4px`,
			border: `${kBorderWidthLg.px} solid ${borderColor}`,
			userSelect: `none`,
		}"
	>
		<img
			:style="{
				width: `${size}px`,
				height: `auto`,
				maxHeight: `${size}px`,
			}"
			:src="imgUrl"
			alt=""
			@dragstart.prevent
		/>

		<div
			:style="{
				fontSize: kFontSizeTiny.px,
				padding: `4px`,
			}"
		>
			{{ displayText }}
		</div>
	</div>
</template>
