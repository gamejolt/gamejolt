import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Screen } from '../screen/screen-service';
import { AppNoAutoscroll } from '../scroll/auto-scroll/no-autoscroll.directive';

const MaxPagesShown = 5;

@Component({
	directives: {
		AppNoAutoscroll,
	},
})
export default class AppPagination extends Vue {
	@Prop(Number) totalItems!: number;
	@Prop(Number) itemsPerPage!: number;
	@Prop(Number) currentPage!: number;
	@Prop({ type: String, default: 'page' })
	queryParam!: string;
	@Prop(Boolean) preventUrlChange?: boolean;

	// These only make sense for pagers.
	@Prop(Boolean) pager?: boolean;
	@Prop(Boolean) reverseButtons?: boolean;
	@Prop(String) nextText?: string;
	@Prop(String) previousText?: string;

	readonly Screen = Screen;

	get totalPages() {
		const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
		return Math.max(totalPages || 0, 1);
	}

	get hasPrevious() {
		return this.currentPage > 1;
	}

	get hasNext() {
		return this.currentPage < this.totalPages;
	}

	get prevPage() {
		return this.currentPage - 1 > 1 ? this.currentPage - 1 : undefined;
	}

	get nextPage() {
		return this.currentPage + 1;
	}

	get pages() {
		const edgePages = this.getEdgePages();

		const pages = [];
		for (let i = edgePages[0]; i <= edgePages[1]; ++i) {
			pages.push(i);
		}

		return pages;
	}

	get prevChunkPage() {
		const edgePages = this.getEdgePages();

		if (edgePages[0] > 1) {
			return edgePages[0] - 1;
		}

		return undefined;
	}

	get nextChunkPage() {
		const edgePages = this.getEdgePages();

		if (edgePages[1] < this.totalPages) {
			return edgePages[1] + 1;
		}

		return undefined;
	}

	private getEdgePages() {
		const startPage = (Math.ceil(this.currentPage / MaxPagesShown) - 1) * MaxPagesShown + 1;

		// Adjust last page if limit is exceeded
		const endPage = Math.min(startPage + MaxPagesShown - 1, this.totalPages);

		return [startPage, endPage];
	}

	getPageLocation(page: number) {
		return {
			name: this.$route.name,
			params: this.$route.params,
			query: this.getQuery(page),
		};
	}

	private getQuery(page: number) {
		return Object.assign({}, this.$route.query, {
			[this.queryParam || 'page']: page,
		});
	}

	onPageClick(event: Event, page: number) {
		if (this.preventUrlChange) {
			event.preventDefault();
		}

		this.$emit('pagechange', page, event);
	}
}
