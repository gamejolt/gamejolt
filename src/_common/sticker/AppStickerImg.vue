<script lang="ts" setup>
import { HTMLAttributes } from 'vue';

type Props = {
	src: string;
	alt?: string;
	size?: number;
} & /* @vue-ignore */ Pick<HTMLAttributes, 'onMousedown' | 'onTouchstart'>;

const { src, alt = '', size } = defineProps<Props>();
</script>

<template>
	<img
		:src="src"
		:width="size"
		:height="size"
		:alt="alt"
		draggable="false"
		@mousedown.prevent
		@dragstart.prevent
	/>
</template>
