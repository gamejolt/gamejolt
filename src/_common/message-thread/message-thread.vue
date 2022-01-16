<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import AppTimelineList from '../timeline-list/timeline-list.vue';

@Options({
	components: {
		AppTimelineList,
	},
})
export default class AppMessageThread extends Vue {
	@Prop(Boolean) isNested?: boolean;
}
</script>

<template>
	<app-timeline-list class="message-thread" :is-nested="isNested">
		<slot />
	</app-timeline-list>
</template>

<style lang="stylus" scoped>
// Don't show the message thread split for the last item in the list.
::v-deep(.message-thread-item:last-of-type .timeline-list-item-split)
	display: none
</style>
