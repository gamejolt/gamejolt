<script lang="ts">
import { computed, useSlots } from 'vue';

import AppPopcornKernel from './AppPopcornKernel.vue';
import {
	createPopcornKettleController,
	PopcornKettleController,
	providePopcornKettleController,
} from './popcorn-kettle-controller';
</script>

<script lang="ts" setup>
type Props = {
	controller?: PopcornKettleController;
};
const { controller } = defineProps<Props>();

const c = controller ?? createPopcornKettleController();
const { kernels } = c;

providePopcornKettleController(c);

const slots = useSlots();

const isWrappingComponent = computed(() => !!slots['default']);
</script>

<template>
	<div class="-popcorn-kettle" :class="isWrappingComponent ? {} : ['-fill', '-ignore']">
		<slot />

		<div class="-kernels -fill -ignore">
			<template v-for="data of kernels" :key="data.key">
				<AppPopcornKernel class="-kernel" :kernel-data="data" />
			</template>
		</div>
	</div>
</template>

<style lang="stylus">
.-popcorn-kettle
	position: relative

	&.-fill
		z-index: 2

.-kernels
	display: flex
	align-items: center
	justify-content: center

.-kernel
	position: fixed

.-fill
	position: absolute
	left: 0
	top: 0
	right: 0
	bottom: 0

.-ignore
	pointer-events: none
</style>
