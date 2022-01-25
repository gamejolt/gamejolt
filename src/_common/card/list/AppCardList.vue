<script lang="ts" setup>
const props = defineProps({
	...defineCardListItems(),
	...defineCardListProps(),
});

const emit = defineEmits({
	activate: (_item: any) => true,
});

const items = ref(props.items);

watch(
	() => props.items,
	() => {
		c.items.value = props.items;
	},
	{
		deep: true,
	}
);

const c = createCardListController(props, item => emit('activate', item), items);
provide(Key, c);
</script>

<script lang="ts">
import { ExtractPropTypes, inject, InjectionKey, provide, Ref, ref, toRefs, watch } from 'vue';

function defineCardListItems() {
	return {
		items: {
			type: Array,
			default: () => [],
		},
	};
}
function defineCardListProps() {
	return {
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
	};
}

const Key: InjectionKey<CardListController> = Symbol('card-list');
export type CardListController = ReturnType<typeof createCardListController>;

export function useCardList() {
	return inject(Key, null);
}

function createCardListController(
	props: ExtractPropTypes<ReturnType<typeof defineCardListProps>>,
	emit: (item: any) => void,
	items: Ref<any[]>
) {
	const { activeItem, isAdding, isDraggable } = toRefs(props);

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

<template>
	<div class="card-list">
		<slot />
	</div>
</template>
