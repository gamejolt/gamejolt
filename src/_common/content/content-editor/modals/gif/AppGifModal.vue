<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, useTemplateRef } from 'vue';
import { Api } from '../../../../api/api.service';
import AppButton from '../../../../button/AppButton.vue';
import { showErrorGrowl } from '../../../../growls/growls.service';
import AppJolticon from '../../../../jolticon/AppJolticon.vue';
import AppLoading from '../../../../loading/AppLoading.vue';
import AppModal from '../../../../modal/AppModal.vue';
import { useModal } from '../../../../modal/modal.service';
import { Ruler } from '../../../../ruler/ruler-service';
import { Screen } from '../../../../screen/screen-service';
import AppScrollScroller, { createScroller } from '../../../../scroll/AppScrollScroller.vue';
import AppTranslate from '../../../../translate/AppTranslate.vue';
import { $gettext } from '../../../../translate/translate.service';
import { Category, SearchResult } from './gif-modal.service';
import mascotImage from './mascot-complete.png';

// This is a module variable so that it only fetches once.
let categoriesCache: Category[] | undefined;

const modal = useModal()!;

const searchTimeout = ref<NodeJS.Timer | null>(null);
const categories = ref<Category[]>([]);
const searchResults = ref<SearchResult[]>([]);
const searchValue = ref('');
const loadingCategories = ref(true);
const isLoading = ref(false);
const loadedGifs = ref<string[]>([]);
// To make sure parallel search requests don't step on each other, this keeps the last term, so all previous searches will cancel.
const currentSearchTerm = ref('');
const currentSearchPage = ref(0);
const maxPages = ref(3);
const perPage = ref(12);
const isLastPage = ref(false);
const hasError = ref(false);
const contentScroller = createScroller();

const modalComponent = useTemplateRef('modalComponent');
const searchInput = useTemplateRef('searchInput');

const shouldShowResetButton = computed(() => searchValue.value.length > 0);
const shouldShowCategories = computed(() => searchValue.value === '');
const reachedLastPage = computed(
	() => currentSearchPage.value === maxPages.value || isLastPage.value
);
const shouldShowMoreButton = computed(
	() => Screen.isXs && searchValue.value.length > 0 && !isLoading.value
);
const isFavorites = computed(() => currentSearchTerm.value.toLowerCase().trim() === 'favorites');

onMounted(async () => {
	await populateCategories();

	// Wait for the categories to be loaded. The input is disabled until they are.
	// Then wait a tick to make sure the `disabled` state goes away.
	// Inputs cannot be focused until they are no longer disabled.
	await nextTick();

	// Focus now.
	searchInput.value?.focus();
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
					if (searchResults.value.every(i => i.id !== result.id)) {
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

	if (searchTimeout.value) {
		clearTimeout(searchTimeout.value);
		searchTimeout.value = null;
		timeoutDelay += 200;
	}

	if (searchResults.value.length === 0) {
		isLoading.value = true;
	}

	searchTimeout.value = setTimeout(() => {
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
	// This has a v-if around it when loading, so it may not be in the DOM.
	contentScroller.scrollTo(0);
	modalComponent.value?.scrollTo(0);
}

function onContainerScroll() {
	if (!isLoading.value && searchValue.value.length > 0 && !reachedLastPage.value) {
		const container = contentScroller.element.value;
		if (container) {
			const height = Ruler.height(container);
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
	// Run this async
	// Also don't care about whether this succeeds or not.
	Api.sendRequest(
		'/web/content/tenor/register-share/' + searchResult.id,
		{},
		{
			detach: true,
		}
	).then();

	modal.resolve(searchResult);
}

function onRetry() {
	hasError.value = false;

	// Reset entire state
	currentSearchPage.value = 0;
	currentSearchTerm.value = '';
	isLastPage.value = false;
	categories.value = [];
	categoriesCache = undefined;
	searchValue.value = '';
	isLoading.value = false;
	searchResults.value = [];
	loadedGifs.value = [];

	if (searchTimeout.value) {
		clearTimeout(searchTimeout.value);
		searchTimeout.value = null;
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
								<!-- prettier-ignore -->
								<div
									v-for="i of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]"
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
							<img :src="mascotImage" title="&hearts;" />
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

<style lang="stylus" src="./gif-modal.styl" scoped></style>
