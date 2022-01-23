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

// Create a separate list of modifiable items so that [draggable] properly
// updates the order of the children.
const modifiableItems = ref([...items.value]);

watch(
	modifiableItems,
	newSort => {
		emit('change', newSort);
	},
	{
		deep: true,
	}
);
</script>

<template>
	<VueDraggable
		v-model="modifiableItems"
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
