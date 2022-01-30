<script lang="ts" setup>
import AppJolticon from '../jolticon/AppJolticon.vue';
import './card.styl';

defineProps({
	isDraggable: {
		type: Boolean,
	},
	isExpandable: {
		type: Boolean,
	},
	isExpanded: {
		type: Boolean,
	},
	isInactive: {
		type: Boolean,
	},
	isDisabled: {
		type: Boolean,
	},
	/** Takes up the padding that would show as if this card was expandable. */
	forceExpandablePadding: {
		type: Boolean,
	},
});
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
