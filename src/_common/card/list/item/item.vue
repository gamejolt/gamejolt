<script lang="ts" setup>
import { computed, toRaw, useSlots } from 'vue';
import AppExpand from '../../../expand/expand.vue';
import { Screen } from '../../../screen/screen-service';
import AppCard from '../../card.vue';
import { useCardList } from '../AppCardList.vue';

const props = defineProps({
	item: {
		type: Object,
		required: true,
	},
	forceActive: {
		type: Boolean,
	},
	/**
	 * Takes up the padding that would show as if this card was expandable.
	 */
	forceExpandablePadding: {
		type: Boolean,
	},
});

const slots = useSlots();
const { isDraggable, activeItem, activate } = useCardList()!;

const isActive = computed(() => {
	return props.forceActive || toRaw(activeItem.value) === toRaw(props.item);
});

const isExpandable = computed(() => !!slots.body);

function onClick() {
	if (!isExpandable.value) {
		return;
	}

	activate(isActive.value ? null : props.item);
}
</script>

<template>
	<div class="card-list-item" :class="{ active: isActive }">
		<AppCard
			:is-expandable="isExpandable"
			:is-expanded="isActive"
			:is-draggable="isDraggable"
			:force-expandable-padding="forceExpandablePadding"
			@click="onClick"
		>
			<div v-if="isDraggable" class="card-drag-handle">
				<app-jolticon icon="arrows-v" />
			</div>
			<slot />
		</AppCard>

		<div class="card-list-item-body full-bleed-xs">
			<AppExpand :when="isActive">
				<div class="well fill-offset" :class="{ 'well-row': Screen.isXs }">
					<slot name="body" />
				</div>
			</AppExpand>
		</div>
	</div>
</template>

<style lang="stylus" src="../list-common.styl" scoped></style>
