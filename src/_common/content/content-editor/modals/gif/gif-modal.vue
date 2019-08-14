<template>
	<app-modal ref="modal" tabindex="0">
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-body">
			<div v-if="hasError" class="error-container">
				<p><translate>Something went wrong.</translate></p>
				<app-button @click="onRetry"><translate>Retry</translate></app-button>
			</div>

			<template v-else>
				<div class="input-container">
					<app-button
						sparse
						trans
						icon="chevron-left"
						v-if="shouldShowResetButton"
						@click="onClickReset"
					/>
					<div class="search-bar">
						<app-jolticon icon="search" class="search-icon text-muted" />
						<div v-if="shouldShowResetButton" class="search-clear" @click="onClickReset">
							<app-jolticon class="-icon" icon="remove" />
						</div>
						<input
							class="search form-control"
							:placeholder="$gettext('Search Tenor...')"
							:disabled="loadingCategories"
							:value="searchValue"
							@input="onSearchInput"
							@keydown="onSearchKeyDown"
						/>
					</div>
				</div>
				<div v-if="loadingCategories" class="loading-categories">
					<app-loading centered big />
				</div>
				<div
					v-else
					ref="contentScroller"
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
							<img src="./mascot-complete.png" title="♥" />
							<span class="text-muted">
								These are not the GIFs you are looking for!
							</span>
						</div>
						<div v-else-if="shouldShowMoreButton" class="more-container">
							<app-button @click="loadNextPage">More</app-button>
						</div>
					</div>
				</div>
			</template>
		</div>
	</app-modal>
</template>

<style lang="stylus" src="./gif-modal.styl" scoped></style>

<script lang="ts" src="./gif-modal"></script>
