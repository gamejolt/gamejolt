<script lang="ts" setup>
import { toRefs } from 'vue';
import { styleChangeBg } from '../../_styles/mixins';
import { watched } from '../reactivity-helpers';

const props = defineProps({
	count: {
		type: Number,
		required: true,
	},
	displayCount: {
		type: Number,
		required: true,
	},
	current: {
		type: Number,
		required: true,
	},
	index: {
		type: Number,
		required: true,
	},
});

const { count, displayCount, current, index } = toRefs(props);

const size = watched(() => {
	if (index.value === current.value || count.value <= displayCount.value) {
		return `100%`;
	}

	const distance = Math.abs(index.value - current.value);
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
