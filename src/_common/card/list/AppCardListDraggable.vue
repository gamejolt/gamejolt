<script lang="ts" setup>
import { ref, watch } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';

import { useCardList } from '~common/card/list/AppCardList.vue';

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
		v-model="modifiableItems"
		handle=".card-drag-handle"
		:delay="100"
		:delay-on-touch-only="true"
		@sort="onDraggableSort"
	>
		<div
			v-for="(element, index) in modifiableItems"
			:key="(element as any)[itemKey]"
		>
			<slot name="item" :element :index />
		</div>
	</VueDraggable>
</template>
