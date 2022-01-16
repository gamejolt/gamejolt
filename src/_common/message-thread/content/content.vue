<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';
import AppTimelineListItem from '../../timeline-list/item/item.vue';

@Options({
	components: {
		AppTimelineListItem,
	},
})
export default class AppMessageThreadContent extends Vue {}
</script>

<template>
	<app-timeline-list-item>
		<slot />
	</app-timeline-list-item>
</template>
