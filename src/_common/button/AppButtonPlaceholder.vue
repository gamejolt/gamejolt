<script lang="ts" setup>
import { styleChangeBg, styleWhen } from '../../_styles/mixins';
import { kBorderRadiusBase, kButtonMdLineHeight } from '../../_styles/variables';

type Props = {
	sparse?: boolean;
	circle?: boolean;
	block?: boolean;
};

defineProps<Props>();
</script>

<template>
	<div
		:style="{
			...styleChangeBg('bg-subtle'),
			borderRadius: kBorderRadiusBase.px,
			display: `inline-block`,
			height: kButtonMdLineHeight.px,
			verticalAlign: `middle`,
			width: `75px`,
			...styleWhen(sparse, {
				width: kButtonMdLineHeight.px,
			}),
			...styleWhen(circle, {
				borderRadius: `100%`,
			}),
			...styleWhen(block, {
				display: `block`,
				width: `100%`,
			}),
		}"
	/>
</template>
