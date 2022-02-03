<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { Screen } from '../screen/screen-service';
import { vAppNoAutoscroll } from '../scroll/auto-scroll/no-autoscroll.directive';

const MaxPagesShown = 5;

@Options({
	directives: {
		AppNoAutoscroll: vAppNoAutoscroll,
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

	@Emit('pagechange')
	emitPageChange(_page: number, _event: Event) {}

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
		return this.hasPrevious ? this.currentPage - 1 : undefined;
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

		this.emitPageChange(page, event);
	}
}
</script>

<template>
	<div>
		<!--
			Number pagination type
		-->
		<template v-if="!pager && !Screen.isXs">
			<div v-if="totalItems > itemsPerPage" class="pagination">
				<div
					v-if="hasPrevious && currentPage !== 2"
					class="pagination-item"
					@click.capture="onPageClick($event, 1)"
				>
					<AppButton v-app-no-autoscroll :to="getPageLocation(1)">
						<AppTranslate>First</AppTranslate>
					</AppButton>
				</div>
				<div
					v-if="hasPrevious"
					class="pagination-item"
					@click.capture="onPageClick($event, prevPage)"
				>
					<AppButton v-app-no-autoscroll :to="getPageLocation(prevPage)">
						<AppTranslate>Previous</AppTranslate>
					</AppButton>
				</div>

				<div
					v-if="prevChunkPage"
					class="pagination-item"
					@click.capture="onPageClick($event, prevChunkPage)"
				>
					<AppButton v-app-no-autoscroll sparse :to="getPageLocation(prevChunkPage)">
						...
					</AppButton>
				</div>

				<div
					v-for="(page, i) of pages"
					:key="i"
					class="pagination-item"
					:class="{ active: page === currentPage }"
					@click.capture="onPageClick($event, page)"
				>
					<AppButton
						v-if="page !== currentPage"
						v-app-no-autoscroll
						sparse
						:to="getPageLocation(page > 1 ? page : undefined)"
					>
						{{ page }}
					</AppButton>
					<AppButton v-else solid sparse>
						{{ page }}
					</AppButton>
				</div>

				<div
					v-if="nextChunkPage"
					class="pagination-item"
					@click.capture="onPageClick($event, nextChunkPage)"
				>
					<AppButton v-app-no-autoscroll sparse :to="getPageLocation(nextChunkPage)">
						...
					</AppButton>
				</div>

				<div
					v-if="hasNext"
					class="pagination-item"
					@click.capture="onPageClick($event, nextPage)"
				>
					<AppButton v-app-no-autoscroll :to="getPageLocation(nextPage)">
						<AppTranslate>Next</AppTranslate>
					</AppButton>
				</div>
				<div
					v-if="hasNext && currentPage !== totalPages - 1"
					class="pagination-item"
					@click.capture="onPageClick($event, totalPages)"
				>
					<AppButton v-app-no-autoscroll :to="getPageLocation(totalPages)">
						<AppTranslate>Last</AppTranslate>
					</AppButton>
				</div>
			</div>
		</template>

		<!--
			Pager type
		-->
		<template v-else-if="pager || Screen.isXs">
			<div class="pager" :class="{ reverse: reverseButtons }">
				<div
					v-if="hasPrevious"
					class="pagination-item previous"
					@click.capture="onPageClick($event, prevPage)"
				>
					<AppButton v-app-no-autoscroll :to="getPageLocation(prevPage)">
						{{ previousText || '&laquo; Previous' }}
					</AppButton>
					<span v-if="!hasPrevious">{{ previousText || '&laquo; Previous' }}</span>
				</div>
				<div v-if="currentPage > 1" class="pagination-item">
					<AppButton solid sparse>
						{{ currentPage }}
					</AppButton>
				</div>
				<div
					v-if="hasNext"
					class="pagination-item next"
					@click.capture="onPageClick($event, nextPage)"
				>
					<AppButton v-app-no-autoscroll :to="getPageLocation(nextPage)">
						{{ nextText || 'Next &raquo;' }}
					</AppButton>
					<span v-if="!hasNext">{{ nextText || 'Next &raquo;' }}</span>
				</div>
			</div>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.pagination
	display: inline-flex
	user-select: none
	flex-wrap: wrap
	justify-content: center
	margin-bottom: $line-height-computed

	&-item
		margin-right: 3px

.pager
	display: inline-flex
	user-select: none
	flex-wrap: wrap
	justify-content: space-between
	padding: $line-height-computed ($grid-gutter-width-xs / 2)
	width: 100%

	&:not(.reverse)
		.pagination-item:last-child
			margin-right: 0

	&.reverse
		flex-direction: row-reverse

		.pagination-item:first-child
			margin-right: 0
</style>
