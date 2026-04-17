<script lang="ts" setup>
import { computed } from 'vue';

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
		class="rounded-full [transition:background-color_300ms,width_300ms,height_300ms]"
		:class="current === index ? 'change-bg-primary' : 'change-bg-bg-subtle'"
		:style="{
			width: size,
			height: size,
		}"
	/>
</template>
