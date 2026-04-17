<script lang="ts" setup>
import '~common/card/card.styl';

import { HTMLAttributes } from 'vue';

import AppJolticon from '~common/jolticon/AppJolticon.vue';

type Props = {
	isDraggable?: boolean;
	isExpandable?: boolean;
	isExpanded?: boolean;
	isDisabled?: boolean;
	/** Takes up the padding that would show as if this card was expandable. */
	forceExpandablePadding?: boolean;
} & /* @vue-ignore */ Pick<HTMLAttributes, 'onClick'>;

const {
	isDraggable = false,
	isExpandable = false,
	isExpanded = false,
	isDisabled = false,
	forceExpandablePadding = false,
} = defineProps<Props>();
</script>

<template>
	<div
		class="card fill-darkest"
		:class="{
			'card-disabled': isDisabled,
			'card-expandable': isExpandable,
			'card-draggable': isDraggable,
			'card-expandable-padding': forceExpandablePadding,
		}"
	>
		<div v-if="isExpandable" class="card-chevron">
			<AppJolticon :icon="isExpanded ? 'chevron-down' : 'chevron-right'" />
		</div>

		<slot />
	</div>
</template>
