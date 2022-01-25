<script lang="ts" setup>
import { ref, watch } from 'vue';
import VueDraggable from 'vuedraggable';
import { useCardList } from './AppCardList.vue';

defineProps({
	itemKey: {
		type: String,
		required: true,
	},
});

const emit = defineEmits({
	change: (_items: any[]) => true,
});

const { items } = useCardList()!;

watch(
	items,
	(newSort, oldValue) => {
		if (newSort === oldValue) {
			return;
		}
		emit('change', newSort);
	},
	{
		deep: true,
	}
);
</script>

<template>
	<VueDraggable
		v-model="items"
		:item-key="itemKey"
		v-bind="{ handle: '.card-drag-handle', delay: 100, delayOnTouchOnly: true }"
	>
		<template #item="{ element, index }: any">
			<div>
				<slot name="item" :element="element" :index="index" />
			</div>
		</template>
	</VueDraggable>
</template>
