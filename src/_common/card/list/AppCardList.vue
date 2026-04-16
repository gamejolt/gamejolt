<script lang="ts">
import { inject, InjectionKey, provide, ref, toRef, ToRefs, watch } from 'vue';

type CardListControllerProps = {
	items?: any[];
	activeItem?: object | null;
	isAdding?: boolean;
	isDraggable?: boolean;
};

const Key: InjectionKey<CardListController> = Symbol('card-list');
export type CardListController = ReturnType<typeof createCardListController>;

export function useCardList() {
	return inject(Key, null);
}

function createCardListController(
	{ items, activeItem, isAdding, isDraggable }: ToRefs<Required<CardListControllerProps>>,
	emit: (item: any) => void
) {
	function activate(item: any | null) {
		emit(item);
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

<script lang="ts" setup>
const {
	items: itemsProp = [],
	activeItem = null,
	isAdding = false,
	isDraggable = false,
} = defineProps<CardListControllerProps>();

const emit = defineEmits<{
	activate: [item: any];
}>();

const c = createCardListController(
	{
		// Create a local ref for the controller. This won't get updated from
		// outside.
		items: ref(itemsProp),
		activeItem: toRef(() => activeItem),
		isAdding: toRef(() => isAdding),
		isDraggable: toRef(() => isDraggable),
	},
	item => emit('activate', item)
);

watch(
	() => itemsProp,
	newItems => {
		if (newItems !== c.items.value) {
			c.items.value = newItems;
		}
	}
);

provide(Key, c);
</script>

<template>
	<div class="card-list">
		<slot />
	</div>
</template>
