<script lang="ts" setup>
import { computed } from 'vue';

import { styleChangeBg } from '~styles/mixins';

type Props = {
	count: number;
	displayCount: number;
	current: number;
	index: number;
};
const { count, displayCount, current, index } = defineProps<Props>();

const size = computed(() => {
	if (index === current || count <= displayCount) {
		return `100%`;
	}

	const distance = Math.abs(index - current);
	if (distance === 1) {
		return `75%`;
	} else if (distance === 2) {
		return `50%`;
	}
	return `25%`;
});
</script>

<template>
	<div
		:style="{
			...styleChangeBg(current === index ? 'primary' : 'bg-subtle'),
			width: size,
			height: size,
			borderRadius: `50%`,
			transition: `background-color 300ms, width 300ms, height 300ms`,
		}"
	/>
</template>
