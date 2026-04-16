<script lang="ts" setup>
import { ref, watch } from 'vue';
import VueDraggable from 'vuedraggable';

import { useCardList } from './AppCardList.vue';

type Props = {
	itemKey: string;
};
const { itemKey } = defineProps<Props>();

const emit = defineEmits<{
	change: [items: any[]];
}>();

const { items } = useCardList()!;

const modifiableItems = ref([...items.value]);

watch(
	items,
	() => {
		if (modifiableItems.value === items.value) {
			return;
		}
		modifiableItems.value = [...items.value];
	},
	{
		deep: true,
	}
);

function onDraggableSort() {
	emit('change', modifiableItems.value);
}
</script>

<template>
	<VueDraggable
		:list="modifiableItems"
		:item-key="itemKey"
		v-bind="{
			handle: '.card-drag-handle',
			delay: 100,
			delayOnTouchOnly: true,
			onSort: onDraggableSort,
		}"
	>
		<template #item="{ element, index }: any">
			<div>
				<slot name="item" :element="element" :index="index" />
			</div>
		</template>
	</VueDraggable>
</template>
