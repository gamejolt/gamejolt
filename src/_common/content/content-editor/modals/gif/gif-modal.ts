import { Component } from 'vue-property-decorator';
import { Api } from '../../../../api/api.service';
import AppLoading from '../../../../loading/loading.vue';
import { BaseModal } from '../../../../modal/base';
import AppModalTS from '../../../../modal/modal';
import { Ruler } from '../../../../ruler/ruler-service';
import { Screen } from '../../../../screen/screen-service';
import AppScrollScrollerTS from '../../../../scroll/scroller/scroller';
import AppScrollScroller from '../../../../scroll/scroller/scroller.vue';
import { Category, ContentEditorGifModal, SearchResult } from './gif-modal.service';

@Component({
	components: {
		AppLoading,
		AppScrollScroller,
	},
})
export default class AppContentEditorGifModal extends BaseModal {
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

	readonly Screen = Screen;

	$refs!: {
		contentScroller: AppScrollScrollerTS;
		modal: AppModalTS;
		search: HTMLInputElement;
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
		this.$refs.modal.$el.focus();

		await this.populateCategories();

		// Wait for the categories to be loaded. The input is disabled until they are.
		// Then wait a tick to make sure the `disabled` state goes away.
		// Inputs cannot be focused until they are no longer disabled.
		await this.$nextTick();
		// Focus now.
		this.$refs.search.focus();
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
		if (this.$refs.contentScroller.$el) {
			this.$refs.contentScroller.$el.scrollTop = 0;
		}
		this.$refs.modal.scrollTo(0);
	}

	onContainerScroll() {
		if (!this.isLoading && this.searchValue.length > 0 && !this.reachedLastPage) {
			const container = this.$refs.contentScroller.$el as HTMLElement;
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
