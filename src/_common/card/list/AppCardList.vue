<script lang="ts" setup>
const props = defineProps({
	items: {
		type: Array,
		default: () => [],
	},
	activeItem: {
		type: Object,
		default: null,
	},
	isAdding: {
		type: Boolean,
	},
	isDraggable: {
		type: Boolean,
	},
});

const emit = defineEmits({
	activate: (_item: any) => true,
});

const c = createCardListController(props, emit);
provide(Key, c);
</script>

<script lang="ts">
import { inject, InjectionKey, provide, toRefs } from 'vue';

const Key: InjectionKey<CardListController> = Symbol('card-list');
export type CardListController = ReturnType<typeof createCardListController>;

export function useCardList() {
	return inject(Key, null);
}

function createCardListController(p: typeof props, e: typeof emit) {
	const { items, activeItem, isAdding, isDraggable } = toRefs(p);

	function activate(item: any | null) {
		e('activate', item);
	}

	return {
		items,
		activeItem,
		isAdding,
		isDraggable,
		activate,
	};
}
</script>

<template>
	<div class="card-list">
		<slot />
	</div>
</template>
