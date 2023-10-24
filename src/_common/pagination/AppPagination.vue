<script lang="ts" setup>
import { computed, toRef, toRefs } from 'vue';
import { useRoute } from 'vue-router';
import AppButton from '../button/AppButton.vue';
import { Screen } from '../screen/screen-service';
import { vAppNoAutoscroll } from '../scroll/auto-scroll/no-autoscroll.directive';
import { $gettext } from '../translate/translate.service';

const props = defineProps({
	totalItems: {
		type: Number,
		required: true,
	},
	itemsPerPage: {
		type: Number,
		required: true,
	},
	currentPage: {
		type: Number,
		required: true,
	},
	queryParam: {
		type: String,
		default: 'page',
	},
	preventUrlChange: {
		type: Boolean,
	},

	// These only make sense for pagers.
	pager: {
		type: Boolean,
	},
	reverseButtons: {
		type: Boolean,
	},
	nextText: {
		type: String,
		default: undefined,
	},
	previousText: {
		type: String,
		default: undefined,
	},
});

const emit = defineEmits({
	pagechange: (_page: number, _event: Event) => true,
});

const MaxPagesShown = 5;

const {
	totalItems,
	itemsPerPage,
	currentPage,
	queryParam,
	preventUrlChange,
	pager,
	reverseButtons,
	nextText,
	previousText,
} = toRefs(props);

const route = useRoute();

const totalPages = computed(() => {
	const totalPages = Math.ceil(totalItems.value / itemsPerPage.value);
	return Math.max(totalPages || 0, 1);
});

const hasPrevious = toRef(() => currentPage.value > 1);

const hasNext = toRef(() => currentPage.value < totalPages.value);

// TODO(component-setup-refactor): having error in template, should we return negative number instead of undefined?
const prevPage = toRef(() => (hasPrevious.value ? currentPage.value - 1 : undefined));

const nextPage = toRef(() => currentPage.value + 1);

const pages = computed(() => {
	const edgePages = getEdgePages();

	const pages = [];
	for (let i = edgePages[0]; i <= edgePages[1]; ++i) {
		pages.push(i);
	}

	return pages;
});

const prevChunkPage = computed(() => {
	const edgePages = getEdgePages();

	if (edgePages[0] > 1) {
		return edgePages[0] - 1;
	}

	return undefined;
});

const nextChunkPage = computed(() => {
	const edgePages = getEdgePages();

	if (edgePages[1] < totalPages.value) {
		return edgePages[1] + 1;
	}

	return undefined;
});

function getEdgePages() {
	const startPage = (Math.ceil(currentPage.value / MaxPagesShown) - 1) * MaxPagesShown + 1;

	// Adjust last page if limit is exceeded
	const endPage = Math.min(startPage + MaxPagesShown - 1, totalPages.value);

	return [startPage, endPage];
}

function getPageLocation(page: number) {
	return {
		name: route.name,
		params: route.params,
		query: getQuery(page),
	};
}

function getQuery(page: number) {
	return Object.assign({}, route.query, {
		[queryParam.value || 'page']: page,
	});
}

function onPageClick(event: Event, page: number) {
	if (preventUrlChange.value) {
		event.preventDefault();
	}

	emit('pagechange', page, event);
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
						{{ $gettext(`First`) }}
					</AppButton>
				</div>
				<div
					v-if="hasPrevious"
					class="pagination-item"
					@click.capture="onPageClick($event, prevPage)"
				>
					<AppButton v-app-no-autoscroll :to="getPageLocation(prevPage)">
						{{ $gettext(`Previous`) }}
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
					<!--TODO(component-setup-refactor): -1 instead of undefined?-->
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
						{{ $gettext(`Next`) }}
					</AppButton>
				</div>
				<div
					v-if="hasNext && currentPage !== totalPages - 1"
					class="pagination-item"
					@click.capture="onPageClick($event, totalPages)"
				>
					<AppButton v-app-no-autoscroll :to="getPageLocation(totalPages)">
						{{ $gettext(`Last`) }}
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
