<script lang="ts" setup>
import AppTimelineList from '../timeline-list/AppTimelineList.vue';
</script>

<template>
	<AppTimelineList class="message-thread">
		<slot />
	</AppTimelineList>
</template>

<style lang="stylus" scoped>
// Don't show the message thread split for the last item in the list.
::v-deep(.message-thread-item:last-of-type .timeline-list-item-split)
	display: none
</style>
