<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, useTemplateRef } from 'vue';

import { Api } from '~common/api/api.service';
import AppButton from '~common/button/AppButton.vue';
import {
	Category,
	SearchResult,
} from '~common/content/content-editor/modals/gif/gif-modal.service';
import mascotImage from '~common/content/content-editor/modals/gif/mascot-complete.png';
import { showErrorGrowl } from '~common/growls/growls.service';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import AppLoading from '~common/loading/AppLoading.vue';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import { getElementHeight } from '~common/ruler/ruler-service';
import { getScreen } from '~common/screen/screen-service';
import AppScrollScroller, { createScroller } from '~common/scroll/AppScrollScroller.vue';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';

// Module-level cache so categories are only fetched once.
let categoriesCache: Category[] | undefined;

const modal = useModal()!;

const modalComponentRef = useTemplateRef('modalComponent');
const searchInputRef = useTemplateRef('searchInput');

const contentScroller = createScroller();

let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const categories = ref<Category[]>([]);
const searchResults = ref<SearchResult[]>([]);
const searchValue = ref('');
const loadingCategories = ref(true);
const isLoading = ref(false);
const loadedGifs = ref<string[]>([]);
// To make sure parallel search requests don't step on each other, this keeps
// the last term, so all previous searches will cancel.
const currentSearchTerm = ref('');
const currentSearchPage = ref(0);
const maxPages = ref(3);
const perPage = ref(12);
const isLastPage = ref(false);
const hasError = ref(false);

const shouldShowResetButton = computed(() => searchValue.value.length > 0);
const shouldShowCategories = computed(() => searchValue.value === '');
const reachedLastPage = computed(
	() => currentSearchPage.value === maxPages.value || isLastPage.value
);
const shouldShowMoreButton = computed(
	() => getScreen().isXs.value && searchValue.value.length > 0 && !isLoading.value
);
const isFavorites = computed(() => currentSearchTerm.value.toLowerCase().trim() === 'favorites');

onMounted(async () => {
	await populateCategories();

	// Wait for the categories to be loaded. The input is disabled until they are.
	// Then wait a tick to make sure the `disabled` state goes away.
	// Inputs cannot be focused until they are no longer disabled.
	await nextTick();

	searchInputRef.value?.focus();
});

async function populateCategories() {
	if (categoriesCache === undefined) {
		try {
			const payload = await Api.sendRequest('/web/content/tenor/categories', undefined, {
				detach: true,
			});
			if (payload.categories) {
				categoriesCache = payload.categories;
				for (let i = 0; i < categoriesCache!.length; i++) {
					categoriesCache![i].index = i;
				}
			}
		} catch (error) {
			console.error(error);
			hasError.value = true;
		}
	}
	categories.value = categoriesCache!;
	loadingCategories.value = false;
}

async function startSearch() {
	const term = searchValue.value;
	currentSearchTerm.value = term;
	const url =
		'/web/content/tenor/search?q=' +
		encodeURIComponent(term) +
		'&page=' +
		currentSearchPage.value;

	try {
		const payload = await Api.sendRequest(url, undefined, { detach: true });
		if (currentSearchTerm.value === term) {
			if (payload.maxPages) {
				maxPages.value = payload.maxPages;
			}
			if (payload.perPage) {
				perPage.value = payload.perPage;
			}

			if (payload.results) {
				isLastPage.value =
					payload.results.length === 0 || payload.results.length < perPage.value;

				for (const result of payload.results) {
					if (searchResults.value.every((i: SearchResult) => i.id !== result.id)) {
						searchResults.value.push(result);
					}
				}
				for (let i = 0; i < searchResults.value.length; i++) {
					searchResults.value[i].index = i;
				}
			}

			isLoading.value = false;

			// After getting more items, wait for items to build and check
			// if we should load again.
			await nextTick();
			onContainerScroll();
		}
	} catch (error) {
		console.error(error);
		hasError.value = true;
	}
}

function onSearchInput(e: Event) {
	if (searchValue.value === '') {
		searchResults.value = [];
	}

	const value = (e.target! as HTMLInputElement).value;
	searchValue.value = value;
	let timeoutDelay = 200;

	if (searchTimeout) {
		clearTimeout(searchTimeout);
		searchTimeout = null;
		timeoutDelay += 200;
	}

	if (searchResults.value.length === 0) {
		isLoading.value = true;
	}

	searchTimeout = setTimeout(() => {
		currentSearchPage.value = 0;
		isLoading.value = true;
		searchResults.value = [];
		scrollToTop();
		startSearch();
	}, timeoutDelay);
}

function onSearchKeyDown(e: KeyboardEvent) {
	if (e.key === 'Enter') {
		scrollToTop();
		isLoading.value = true;
		searchResults.value = [];
		startSearch();
	}
}

function onClickReset() {
	searchValue.value = '';
	currentSearchPage.value = 0;
	scrollToTop();
}

function onClickCategory(searchTerm: string) {
	searchValue.value = searchTerm;
	scrollToTop();
	isLoading.value = true;
	searchResults.value = [];
	startSearch();
}

function scrollToTop() {
	contentScroller.scrollTo(0);
	modalComponentRef.value?.scrollTo(0);
}

function onContainerScroll() {
	if (!isLoading.value && searchValue.value.length > 0 && !reachedLastPage.value) {
		const container = contentScroller.element.value;
		if (container) {
			const height = getElementHeight(container);
			if (container.scrollHeight < container.scrollTop + height + 100) {
				loadNextPage();
			}
		}
	}
}

function loadNextPage() {
	currentSearchPage.value++;
	isLoading.value = true;
	startSearch();
}

function onClickSearchResult(searchResult: SearchResult) {
	// Run async, don't care about success.
	Api.sendRequest(
		'/web/content/tenor/register-share/' + searchResult.id,
		{},
		{ detach: true }
	).then();

	modal.resolve(searchResult);
}

function onRetry() {
	hasError.value = false;
	currentSearchPage.value = 0;
	currentSearchTerm.value = '';
	isLastPage.value = false;
	categories.value = [];
	categoriesCache = undefined;
	searchValue.value = '';
	isLoading.value = false;
	searchResults.value = [];
	loadedGifs.value = [];

	if (searchTimeout) {
		clearTimeout(searchTimeout);
		searchTimeout = null;
	}

	loadingCategories.value = true;
	populateCategories();
}

async function toggleFavorite(searchResult: SearchResult) {
	const toggleTo = !searchResult.favorite;
	searchResult.favorite = toggleTo;

	const url =
		`/web/content/tenor/` +
		(toggleTo ? 'add-favorite' : 'remove-favorite') +
		`/${searchResult.id}`;
	const response = await Api.sendRequest(url, {});
	if (!response.success) {
		showErrorGrowl(
			$gettext(
				`Sorry, you have reached the maximum number of favorite GIFs. To add more, please remove some from your Favorites list.`
			)
		);
		searchResult.favorite = !toggleTo;
	}
}
</script>

<template>
	<AppModal ref="modalComponent" tabindex="0">
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>

		<div class="modal-body">
			<div v-if="hasError" class="error-container">
				<p><AppTranslate>Something went wrong.</AppTranslate></p>
				<AppButton @click="onRetry"><AppTranslate>Retry</AppTranslate></AppButton>
			</div>

			<template v-else>
				<div class="input-container">
					<AppButton
						v-if="shouldShowResetButton"
						sparse
						trans
						icon="chevron-left"
						@click="onClickReset"
					/>
					<div class="search-bar">
						<AppJolticon icon="search" class="search-icon text-muted" />
						<div
							v-if="shouldShowResetButton"
							class="search-clear"
							@click="onClickReset"
						>
							<AppJolticon class="-icon" icon="remove" />
						</div>
						<input
							ref="searchInput"
							class="search form-control"
							:placeholder="$gettext('Search Tenor...')"
							:disabled="loadingCategories ? 'true' : undefined"
							:value="searchValue"
							@input="onSearchInput"
							@keydown="onSearchKeyDown"
						/>
					</div>
				</div>
				<div v-if="loadingCategories" class="loading-categories">
					<AppLoading centered big />
				</div>
				<AppScrollScroller
					v-else
					:controller="contentScroller"
					class="gif-content"
					:class="{
						'gif-content-noscroll': isLoading && searchResults.length === 0,
					}"
					@scroll="onContainerScroll"
				>
					<div v-if="shouldShowCategories" class="-grid">
						<div
							v-for="category of categories"
							:key="category.searchterm"
							class="-grid-item anim-fade-in-up"
							:style="{
								'animation-delay': category.index * 0.02 + 's',
							}"
							@click="onClickCategory(category.searchterm)"
						>
							<div class="category">
								<img v-if="category.previewGif" :src="category.previewGif" />
								<div class="category-text">
									<span>{{ category.searchterm }}</span>
								</div>
							</div>
						</div>
					</div>
					<div v-else>
						<div class="-grid">
							<div
								v-for="searchResult of searchResults"
								:key="searchResult.id"
								class="-grid-item anim-fade-in-up"
								:style="{
									'animation-delay': searchResult.index * 0.02 + 's',
								}"
								@click="onClickSearchResult(searchResult)"
							>
								<div class="search-result">
									<img :src="searchResult.previewGif" />
									<div
										class="search-result-favorite-icon"
										@click.stop="toggleFavorite(searchResult)"
									>
										<AppJolticon
											:icon="searchResult.favorite ? 'heart-filled' : 'heart'"
											big
											:notice="searchResult.favorite"
										/>
									</div>
								</div>
							</div>
							<template v-if="isLoading">
								<div
									v-for="i of [
										0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
									]"
									:key="i"
									class="-grid-item"
								>
									<div
										class="search-result-placeholder search-result-loading"
										:style="{
											'animation-delay': i * 0.02 + 's',
										}"
									/>
								</div>
							</template>
						</div>
						<div v-if="reachedLastPage" class="end-of-scroll">
							<img :src="mascotImage" title="♥" />
							<span class="text-muted">
								<template v-if="isFavorites">
									{{
										$gettext(
											`Looks like you'll need to favorite some more GIFs!`
										)
									}}
								</template>
								<template v-else>
									{{ $gettext(`These are not the GIFs you are looking for!`) }}
								</template>
							</span>
						</div>
						<div v-else-if="shouldShowMoreButton" class="more-container">
							<AppButton @click="loadNextPage">More</AppButton>
						</div>
					</div>
				</AppScrollScroller>
			</template>
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped>
$panel-height = 160px
$panel-margin = 8px
$result-border-width = 4px

@keyframes search-result-loading-anim
	0%
		change-bg('bg-offset')

	50%
		change-bg('bg-subtle')

	100%
		change-bg('bg-offset')

@keyframes search-result-incoming
	0%
		transform: translateY(32px)
		opacity: 0

	100%
		transform: none
		opacity: 100%

.input-container
	display: flex
	align-items: center

.search-bar
	flex-grow: 1
	margin-left: 8px
	position: relative

.search
	display: inline-block
	height: $button-md-line-height
	padding-left: 40px
	padding-right: 40px

.search-icon
	position: absolute
	top: 10px
	left: 14px

.search-clear
	position: absolute
	display: flex
	align-items: center
	justify-content: center
	top: 0
	right: 0
	width: $button-md-line-height
	height: $button-md-line-height
	cursor: pointer

	.-icon
		color: var(--theme-fg-muted)

	&:hover .-icon
		color: var(--theme-fg)

.loading-categories
	display: flex
	justify-content: center
	margin-top: 80px
	margin-bottom: 80px

.gif-content
	margin-top: 24px
	position: relative

	// On mobile we allow the normal scrollbar to scroll the content, otherwise
	// we want to put the scrollbar in the modal.
	@media $media-md-up
		height: 60vh
		overflow-y: scroll
		margin-left: -($panel-margin)
		margin-right: -($panel-margin)

.gif-content-noscroll
	overflow-y: hidden !important

.-grid
	display: flex
	flex-wrap: wrap
	justify-content: center

	&-item
		display: flex
		justify-content: center
		position: relative
		width: 100%
		height: $panel-height
		padding: $panel-margin
		animation-duration: 0.4s

		@media $media-sm-up
			width: (100% / 3)

		@media $media-lg-up
			width: (100% / 3)

		img
			rounded-corners-lg()
			display: block
			width: 100%
			height: $panel-height - $panel-margin * 2
			// This will center it within the container and make sure it covers
			// the full space.
			object-fit: cover
			object-position: center

.category
	rounded-corners-lg()
	overflow: hidden
	width: 100%
	cursor: pointer
	background-color: var(--theme-bg-offset)

	img
		transition: filter 0.1s, transform 0.1s ease
		filter: brightness(0.6)

	&:hover img
		filter: brightness(0.3)
		transform: scaleX(1.1) scaleY(1.1)

.category-text
	position: absolute
	top: 0
	left: 0
	right: 0
	bottom: 0
	display: flex
	justify-content: center
	align-items: center
	color: $gray-lightest
	text-align: center

	& > span
		text-shadow: 0 2px rgba(0, 0, 0, 0.5)
		font-size: $font-size-h4
		font-weight: bold

.search-result
	rounded-corners-lg()
	width: 100%
	overflow: hidden
	background-color: transparent
	cursor: pointer
	border-color: transparent
	transition: border-color 0.2s, background-color 0.2s ease
	box-sizing: content-box
	position: relative
	border: $result-border-width solid transparent
	margin: -($result-border-width)

	&:hover
		border-color: var(--theme-backlight)
		background-color: var(--theme-backlight)

.search-result-favorite-icon
	cursor: pointer
	position: absolute
	z-index: 2
	top: 8px
	right: 8px
	filter: drop-shadow(0 0 4px var(--theme-bg))
	transition: transform 0.1s ease

	&:hover
		transform: scaleX(1.25) scaleY(1.25)

.search-result-placeholder
	rounded-corners-lg()
	width: 100%
	height: $panel-height - ($panel-margin * 2)
	animation-duration: 0.8s
	animation-name: search-result-loading-anim
	animation-iteration-count: infinite

.end-of-scroll
	display: flex
	align-items: center
	padding-top: 64px
	padding-bottom: 40px
	flex-direction: column

	& img
		height: 80px
		margin-bottom: 32px

.more-container
	display: flex
	justify-content: center
	margin-top: 10px
	margin-bottom: 10px

.error-container
	width: 100%
	display: flex
	justify-content: center
	align-items: center
	flex-direction: column
	min-height: 200px
</style>
