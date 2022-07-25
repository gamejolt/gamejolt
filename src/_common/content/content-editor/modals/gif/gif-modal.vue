<script lang="ts">
import { nextTick } from 'vue';
import { mixins, Options } from 'vue-property-decorator';
import { shallowSetup } from '../../../../../utils/vue';
import { Api } from '../../../../api/api.service';
import AppLoading from '../../../../loading/AppLoading.vue';
import { AppModalInterface } from '../../../../modal/AppModal.vue';
import { BaseModal } from '../../../../modal/base';
import { Ruler } from '../../../../ruler/ruler-service';
import { Screen } from '../../../../screen/screen-service';
import AppScrollScroller, { createScroller } from '../../../../scroll/AppScrollScroller.vue';
import { Category, ContentEditorGifModal, SearchResult } from './gif-modal.service';
import mascotImage from './mascot-complete.png';

@Options({
	components: {
		AppLoading,
		AppScrollScroller,
	},
})
export default class AppContentEditorGifModal extends mixins(BaseModal) {
	private searchTimeout: NodeJS.Timer | null = null;
	categories: Category[] = [];
	searchResults: SearchResult[] = [];
	searchValue = '';
	loadingCategories = true;
	isLoading = false;
	loadedGifs = [] as string[];
	// To make sure parallel search requests don't step on each other, this keeps the last term, so all previous searches will cancel.
	currentSearchTerm = '';
	currentSearchPage = 0;
	isLastPage = false;
	hasError = false;
	contentScroller = shallowSetup(() => createScroller());

	readonly Screen = Screen;
	readonly mascotImage = mascotImage;

	declare $refs: {
		modalComponent: AppModalInterface;
		searchInput: HTMLInputElement;
	};

	get shouldShowResetButton() {
		return this.searchValue.length > 0;
	}

	get shouldShowCategories() {
		return this.searchValue === '';
	}

	get reachedLastPage() {
		return this.currentSearchPage === 3 || this.isLastPage;
	}

	get shouldShowMoreButton() {
		return Screen.isXs && this.searchValue.length > 0 && !this.isLoading;
	}

	async mounted() {
		await this.populateCategories();

		// Wait for the categories to be loaded. The input is disabled until they are.
		// Then wait a tick to make sure the `disabled` state goes away.
		// Inputs cannot be focused until they are no longer disabled.
		await nextTick();

		// Focus now.
		this.$refs.searchInput.focus();
	}

	private async populateCategories() {
		if (ContentEditorGifModal.categories === undefined) {
			try {
				const payload = await Api.sendRequest('/web/content/tenor/categories', undefined, {
					detach: true,
				});
				if (payload.categories) {
					ContentEditorGifModal.categories = payload.categories;
					for (let i = 0; i < ContentEditorGifModal.categories!.length; i++) {
						ContentEditorGifModal.categories![i].index = i;
					}
				}
			} catch (error) {
				console.error(error);
				this.hasError = true;
			}
		}
		this.categories = ContentEditorGifModal.categories!;
		this.loadingCategories = false;
	}

	private async startSearch() {
		const term = this.searchValue;
		this.currentSearchTerm = term;
		const url =
			'/web/content/tenor/search?q=' +
			encodeURIComponent(term) +
			'&page=' +
			this.currentSearchPage;

		try {
			const payload = await Api.sendRequest(url, undefined, { detach: true });
			if (this.currentSearchTerm === term) {
				if (payload.results) {
					this.isLastPage = payload.results.length === 0;

					for (const result of payload.results) {
						if (this.searchResults.every(i => i.id !== result.id)) {
							this.searchResults.push(result);
						}
					}
					for (let i = 0; i < this.searchResults.length; i++) {
						this.searchResults[i].index = i;
					}
				}
				this.isLoading = false;
			}
		} catch (error) {
			console.error(error);
			this.hasError = true;
		}
	}

	onSearchInput(e: Event) {
		if (this.searchValue === '') {
			this.searchResults = [];
		}

		const value = (e.target! as HTMLInputElement).value;
		this.searchValue = value;
		let timeoutDelay = 200;

		if (this.searchTimeout) {
			clearTimeout(this.searchTimeout);
			this.searchTimeout = null;
			timeoutDelay += 200;
		}

		if (this.searchResults.length === 0) {
			this.isLoading = true;
		}

		this.searchTimeout = setTimeout(() => {
			this.currentSearchPage = 0;
			this.isLoading = true;
			this.searchResults = [];
			this.scrollToTop();
			this.startSearch();
		}, timeoutDelay);
	}

	onSearchKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			this.scrollToTop();

			this.isLoading = true;
			this.searchResults = [];
			this.startSearch();
		}
	}

	onClickReset() {
		this.searchValue = '';
		this.currentSearchPage = 0;
		this.scrollToTop();
	}

	onClickCategory(searchTerm: string) {
		this.searchValue = searchTerm;
		this.scrollToTop();

		this.isLoading = true;
		this.searchResults = [];
		this.startSearch();
	}

	isGifLoading(id: string) {
		return !this.loadedGifs.includes(id);
	}

	onGifLoaded(id: string) {
		this.loadedGifs.push(id);
	}

	scrollToTop() {
		// This has a v-if around it when loading, so it may not be in the DOM.
		this.contentScroller.scrollTo(0);
		this.$refs.modalComponent.scrollTo(0);
	}

	onContainerScroll() {
		if (!this.isLoading && this.searchValue.length > 0 && !this.reachedLastPage) {
			const container = this.contentScroller.element.value;
			if (container) {
				const height = Ruler.height(container);
				if (container.scrollHeight < container.scrollTop + height + 100) {
					this.loadNextPage();
				}
			}
		}
	}

	loadNextPage() {
		this.currentSearchPage++;
		this.isLoading = true;
		this.startSearch();
	}

	onClickSearchResult(searchResult: SearchResult) {
		// Run this async
		// Also don't care about whether this succeeds or not.
		Api.sendRequest(
			'/web/content/tenor/register-share/' + searchResult.id,
			{},
			{
				detach: true,
			}
		).then();

		this.modal.resolve(searchResult);
	}

	onRetry() {
		this.hasError = false;

		// Reset entire state
		this.currentSearchPage = 0;
		this.currentSearchTerm = '';
		this.isLastPage = false;
		this.categories = [];
		ContentEditorGifModal.categories = undefined;
		this.searchValue = '';
		this.isLoading = false;
		this.searchResults = [];
		this.loadedGifs = [];

		if (this.searchTimeout) {
			clearTimeout(this.searchTimeout);
			this.searchTimeout = null;
		}

		this.loadingCategories = true;
		this.populateCategories();
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
								<img :src="category.previewGif" />
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
							<img :src="mascotImage" title="♥" />
							<span class="text-muted">
								These are not the GIFs you are looking for!
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
