<script lang="ts" setup>
import { kBorderRadiusBase, kButtonMdLineHeight } from '~styles/variables';

type Props = {
	sparse?: boolean;
	circle?: boolean;
	block?: boolean;
};

const { sparse, circle, block } = defineProps<Props>();
</script>

<template>
	<div
		class="change-bg-bg-subtle align-middle"
		:class="{
			block: block,
			'inline-block': !block,
		}"
		:style="{
			borderRadius: circle ? `100%` : kBorderRadiusBase.px,
			height: kButtonMdLineHeight.px,
			width: sparse ? kButtonMdLineHeight.px : block ? `100%` : `75px`,
		}"
	/>
</template>
