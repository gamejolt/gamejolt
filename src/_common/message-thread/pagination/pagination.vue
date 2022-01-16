<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import AppPagination from '../../pagination/pagination.vue';
import AppTimelineListItem from '../../timeline-list/item/item.vue';

@Options({
	components: {
		AppTimelineListItem,
		AppPagination,
	},
})
export default class AppMessageThreadPagination extends Vue {
	@Prop(Number) itemsPerPage!: number;
	@Prop(Number) totalItems!: number;
	@Prop(Number) currentPage!: number;
	@Prop(Boolean) pager?: boolean;
	@Prop(Boolean) preventUrlChange?: boolean;

	@Emit('pagechange')
	emitPageChange(..._args: any[]) {}

	get hasPages() {
		return this.totalItems > this.itemsPerPage;
	}

	pageChange(...args: any[]) {
		this.emitPageChange(...args);
	}
}
</script>

<template>
	<app-timeline-list-item v-if="hasPages">
		<div class="timeline-list-item-details">
			<br />

			<app-pagination
				:items-per-page="itemsPerPage"
				:total-items="totalItems"
				:current-page="currentPage"
				:pager="pager"
				:prevent-url-change="preventUrlChange"
				@pagechange="pageChange"
			/>
		</div>
	</app-timeline-list-item>
</template>
