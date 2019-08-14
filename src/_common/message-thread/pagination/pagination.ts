import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppPagination from '../../pagination/pagination.vue'
import AppTimelineListItem from '../../timeline-list/item/item.vue'

@Component({
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

	get hasPages() {
		return this.totalItems > this.itemsPerPage;
	}

	pageChange(...args: any[]) {
		this.$emit('pagechange', ...args);
	}
}
