<template>
	<div>
		<!--
		Number pagination type
	-->
		<template v-if="!pager && !Screen.isXs">
			<div class="pagination" v-if="totalItems > itemsPerPage">
				<div
					class="pagination-item"
					v-if="hasPrevious && currentPage !== 2"
					@click.capture="onPageClick($event, 1)"
				>
					<app-button :to="getPageLocation(1)" v-app-no-autoscroll>
						<translate>First</translate>
					</app-button>
				</div>
				<div
					class="pagination-item"
					v-if="hasPrevious"
					@click.capture="onPageClick($event, prevPage)"
				>
					<app-button :to="getPageLocation(prevPage)" v-app-no-autoscroll>
						<translate>Previous</translate>
					</app-button>
				</div>

				<div
					class="pagination-item"
					v-if="prevChunkPage"
					@click.capture="onPageClick($event, prevChunkPage)"
				>
					<app-button sparse :to="getPageLocation(prevChunkPage)" v-app-no-autoscroll>
						...
					</app-button>
				</div>

				<div
					class="pagination-item"
					v-for="(page, i) of pages"
					:key="i"
					:class="{ active: page === currentPage }"
					@click.capture="onPageClick($event, page)"
				>
					<app-button
						v-if="page !== currentPage"
						sparse
						:to="getPageLocation(page > 1 ? page : undefined)"
						v-app-no-autoscroll
					>
						{{ page }}
					</app-button>
					<app-button solid sparse v-else>
						{{ page }}
					</app-button>
				</div>

				<div
					class="pagination-item"
					v-if="nextChunkPage"
					@click.capture="onPageClick($event, nextChunkPage)"
				>
					<app-button sparse :to="getPageLocation(nextChunkPage)" v-app-no-autoscroll>
						...
					</app-button>
				</div>

				<div class="pagination-item" v-if="hasNext" @click.capture="onPageClick($event, nextPage)">
					<app-button :to="getPageLocation(nextPage)" v-app-no-autoscroll>
						<translate>Next</translate>
					</app-button>
				</div>
				<div
					class="pagination-item"
					v-if="hasNext && currentPage !== totalPages - 1"
					@click.capture="onPageClick($event, totalPages)"
				>
					<app-button :to="getPageLocation(totalPages)" v-app-no-autoscroll>
						<translate>Last</translate>
					</app-button>
				</div>
			</div>
		</template>

		<!--
		Pager type
	-->
		<template v-else-if="pager || Screen.isXs">
			<div class="pager" :class="{ reverse: reverseButtons }">
				<div
					class="pagination-item previous"
					v-if="hasPrevious"
					@click.capture="onPageClick($event, prevPage)"
				>
					<app-button :to="getPageLocation(prevPage)" v-app-no-autoscroll>
						{{ previousText || '&laquo; Previous' }}
					</app-button>
					<span v-if="!hasPrevious">{{ previousText || '&laquo; Previous' }}</span>
				</div>
				<div class="pagination-item" v-if="currentPage > 1">
					<app-button solid sparse>
						{{ currentPage }}
					</app-button>
				</div>
				<div
					class="pagination-item next"
					v-if="hasNext"
					@click.capture="onPageClick($event, nextPage)"
				>
					<app-button :to="getPageLocation(nextPage)" v-app-no-autoscroll>
						{{ nextText || 'Next &raquo;' }}
					</app-button>
					<span v-if="!hasNext">{{ nextText || 'Next &raquo;' }}</span>
				</div>
			</div>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.pagination
	clearfix()
	display: inline-block
	padding-left: 0
	margin-bottom: $line-height-computed
	user-select: none

	&-item
		float: left
		margin-right: 3px

.pager
	clearfix()
	padding-left: 0
	margin: $line-height-computed 0
	list-style: none
	text-align: center
	user-select: none

	.pagination-item
		float: none

		&.next
			float: right

		&.previous
			float: left

	&.reverse
		.pagination-item.next
			float: left

		.pagination-item.previous
			float: right
</style>

<script lang="ts" src="./pagination"></script>
