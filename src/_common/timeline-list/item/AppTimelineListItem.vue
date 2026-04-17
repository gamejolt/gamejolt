<script lang="ts" setup>
import '~common/timeline-list/item/item-content.styl';

import { toRef, useSlots } from 'vue';

type Props = {
	isActive?: boolean;
	isNew?: boolean;
	isThread?: boolean;
	isLast?: boolean;
};
const { isActive = false, isNew = false, isThread = false, isLast = false } = defineProps<Props>();

const slots = useSlots();

const hasBubble = toRef(() => !!slots.bubble);
</script>

<template>
	<div
		class="timeline-list-item"
		:class="{
			new: isNew,
			active: isActive,
			'is-thread': isThread,
			'is-last': isLast,
		}"
	>
		<div class="timeline-list-item-connector" />

		<div v-if="hasBubble" class="timeline-list-item-bubble">
			<div class="timeline-list-item-bubble-inner">
				<slot name="bubble" />
			</div>
		</div>

		<div class="timeline-list-item-main">
			<slot />
		</div>
	</div>
</template>
