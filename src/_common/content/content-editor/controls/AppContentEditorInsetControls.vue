<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useContentEditorController } from '../content-editor-controller';

const controller = useContentEditorController()!;
const container = ref<HTMLDivElement>();
const top = ref(0);

const shouldShow = computed(() => !!view.value && !isOverflowing.value);

const view = computed(() => controller.view);

const isOverflowing = computed(() => top.value <= -8 || controller.window.height - top.value <= 12);

watch(
	() => {
		const {
			scope: { cursorStartHeight, isFocused },
			relativeCursorTop,
		} = controller;

		if (isFocused) {
			return relativeCursorTop - cursorStartHeight / 2;
		} else {
			// Helps to smooth animations when focus changes.
			return top.value;
		}
	},
	newValue => {
		top.value = newValue;
	}
);
</script>

<template>
	<div ref="container" class="inset-controls-container" :style="{ top: top + 'px' }">
		<slot v-if="shouldShow" />
	</div>
</template>

<style lang="stylus" scoped>
.inset-controls-container
	position: absolute
	display: flex
	align-items: center
	// Offset for the '.form-control' padding
	right: $padding-base-horizontal

	& ::v-deep(.inset-container-controls)
		display: block
		margin-left: 8px
</style>
