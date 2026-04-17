<script lang="ts" setup>
import { CSSProperties } from 'vue';

type Props = {
	count: number;
	current: number;
	innerStyles?: CSSProperties;
};
const { count, current, innerStyles } = defineProps<Props>();
</script>

<template>
	<div class="flex flex-row items-center justify-center">
		<div class="inline-flex items-center flex-wrap gap-[4px]" :style="innerStyles">
			<div
				v-for="i of count"
				:key="i"
				class="w-[6px] h-[6px] rounded-full"
				:class="current === i ? 'change-bg-primary' : 'change-bg-bg-subtle'"
			/>
		</div>
	</div>
</template>
