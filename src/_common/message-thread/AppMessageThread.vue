<script lang="ts" setup>
import AppTimelineList from '../timeline-list/timeline-list.vue';

defineProps({
	isNested: {
		type: Boolean,
	},
});
</script>

<template>
	<AppTimelineList class="message-thread" :is-nested="isNested">
		<slot />
	</AppTimelineList>
</template>

<style lang="stylus" scoped>
// Don't show the message thread split for the last item in the list.
::v-deep(.message-thread-item:last-of-type .timeline-list-item-split)
	display: none
</style>
