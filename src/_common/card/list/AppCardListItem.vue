<script lang="ts" setup>
import { computed, HTMLAttributes, toRaw, useSlots } from 'vue';

import AppExpand from '../../expand/AppExpand.vue';
import AppJolticon from '../../jolticon/AppJolticon.vue';
import { Screen } from '../../screen/screen-service';
import AppCard from '../AppCard.vue';
import { useCardList } from './AppCardList.vue';

type Props = {
	item: object;
	forceActive?: boolean;
	/**
	 * Takes up the padding that would show as if this card was expandable.
	 */
	forceExpandablePadding?: boolean;
} & /* @vue-ignore */ Pick<HTMLAttributes, 'onClick' | 'onMouseenter' | 'onMouseleave'>;

const { item, forceActive = false, forceExpandablePadding = false } = defineProps<Props>();

const slots = useSlots();
const { isDraggable, activeItem, activate } = useCardList()!;

const isActive = computed(() => {
	return forceActive || toRaw(activeItem.value) === toRaw(item);
});

const isExpandable = computed(() => !!slots.body);

function onClick() {
	if (!isExpandable.value) {
		return;
	}

	activate(isActive.value ? null : item);
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
				<AppJolticon icon="arrows-v" />
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

<style lang="stylus" src="./list-common.styl" scoped></style>
