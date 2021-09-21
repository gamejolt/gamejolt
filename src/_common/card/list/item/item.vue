<script lang="ts" setup>
import { computed, toRefs, useSlots } from 'vue';
import { Screen } from '../../../screen/screen-service';
import AppCard from '../../card.vue';
import { useCardList } from '../list.vue';

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
const list = useCardList()!;
const { isDraggable } = toRefs(list);

const isActive = computed(() => props.forceActive || list.activeItem === props.item);
// TODO(vue3): check
const isExpandable = computed(() => !!slots.body);

function onClick() {
	if (!isExpandable.value) {
		return;
	}

	list.activate(isActive.value ? null : props.item);
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
			<app-expand :when="isActive">
				<div class="well fill-offset" :class="{ 'well-row': Screen.isXs }">
					<slot name="body" />
				</div>
			</app-expand>
		</div>
	</div>
</template>

<style lang="stylus" src="../list-common.styl" scoped></style>
