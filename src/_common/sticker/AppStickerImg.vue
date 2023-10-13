<script lang="ts" setup>
import { PropType } from 'vue';

defineProps({
	src: {
		type: String,
		required: true,
	},
	alt: {
		type: String,
		default: '',
	},
	size: {
		type: [Number, String] as PropType<number | string>,
		default: undefined,
	},
});
</script>

<template>
	<img
		:src="src"
		:width="size"
		:height="size"
		:alt="alt"
		draggable="false"
		onmousedown="return false;"
		@dragstart.prevent
	/>
</template>
