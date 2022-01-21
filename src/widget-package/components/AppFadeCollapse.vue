<script lang="ts" setup>
import { nextTick, onMounted, ref } from 'vue';
import { Ruler } from '../../_common/ruler/ruler-service';

const emit = defineEmits({
	required: () => true,
});

const root = ref<HTMLElement>();
const inner = ref<HTMLElement>();
const height = ref(0);
const innerHeight = ref(0);
const isCollapsed = ref(false);

onMounted(async () => {
	await nextTick();
	height.value = Ruler.height(root.value!);
	innerHeight.value = Ruler.height(inner.value!);

	if (innerHeight.value > height.value) {
		isCollapsed.value = true;
		emit('required');
	}
});
</script>

<template>
	<div class="-fade-collapse" :class="{ '-is-collapsed': isCollapsed }">
		<div ref="inner">
			<slot />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-fade-collapse
	position: relative
	overflow: hidden

	&::before
		position: absolute
		display: none
		content: ''
		bottom: 0
		left: 0
		right: 0
		height: 25px
		pointer-events: none
		z-index: 1

	// Light theme.
	.theme-light &
		&::before
			background-image: linear-gradient(to bottom, var(--theme-bg-offset-trans) 0, var(--theme-bg-offset) 100%)

	// Dark theme.
	.theme-dark &
		&::before
			background-image: linear-gradient(to bottom, var(--theme-darker-trans) 0, var(--theme-darker) 100%)

	&.-is-collapsed
		&::before
			display: block
</style>
