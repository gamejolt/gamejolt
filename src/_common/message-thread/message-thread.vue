<template>
	<app-timeline-list class="message-thread" :is-nested="isNested">
		<slot />
	</app-timeline-list>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

// Don't show the message thread split for the last item in the list.
>>> .message-thread-item:last-of-type .timeline-list-item-split
	display: none
</style>

<script lang="ts" src="./message-thread"></script>
