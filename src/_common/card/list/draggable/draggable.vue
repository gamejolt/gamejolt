<script lang="ts" setup>
import { computed, watch } from 'vue';
// TODO(vue3): Check if this import works
import Draggable from 'vuedraggable';
import { useCardList } from '../list.vue';

const props = defineProps({
	disabled: {
		type: Boolean,
	},
});

const emit = defineEmits({
	change: (_items: any[]) => true,
});

const list = useCardList()!;

// Gotta sync from vuedraggable changing the data.
const items = computed({
	get: () => list.items,
	set: (items: any[]) => emit('change', items),
});

watch(
	() => props.disabled,
	isDisabled => {
		list.isDraggable = !isDisabled;
	},
	{ immediate: true }
);
</script>

<template>
	<Draggable
		v-model="items"
		:options="{
			handle: '.card-drag-handle',
			delay: 100,
			delayOnTouchOnly: true,
		}"
	>
		<slot />
	</Draggable>
</template>
