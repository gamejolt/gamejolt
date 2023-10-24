<script lang="ts" setup>
import { toRef, useSlots } from 'vue';
import './item-content.styl';

defineProps({
	isActive: {
		type: Boolean,
	},
	isNew: {
		type: Boolean,
	},
	isThread: {
		type: Boolean,
	},
	isLast: {
		type: Boolean,
	},
});

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
