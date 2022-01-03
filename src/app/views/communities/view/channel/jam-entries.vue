<script lang="ts" src="./jam-entries"></script>

<template>
	<div>
		<template v-if="!competition.entry_count">
			<h2 class="section-header">
				<translate>Entries</translate>
			</h2>

			<app-illustration :src="illNoComments">
				<p>
					<translate>No entries have been submitted to this jam yet...</translate>
				</p>
			</app-illustration>
		</template>
		<template v-else>
			<h2 class="section-header">
				<translate
					:translate-n="competition.entry_count"
					:translate-params="{
						count: formatNumber(competition.entry_count),
					}"
					translate-plural="%{ count } Entries"
				>
					%{ count } Entry
				</translate>
			</h2>

			<div v-if="hasCategories" class="-category-nav-container">
				<router-link
					v-for="categoryOption of categoryOptions"
					:key="categoryOption.text"
					v-app-no-autoscroll
					:to="{
						query: {
							category: categoryOption.category || undefined,
							sort: undefined,
							page: undefined,
						},
					}"
					class="-category-nav-item"
					:class="{
						'-category-nav-item-active': category === categoryOption.category,
					}"
				>
					{{ categoryOption.text }}
					<div
						v-if="category === categoryOption.category"
						class="-category-nav-item-active-bar"
					/>
				</router-link>
			</div>

			<div>
				<span v-if="!category" class="pull-right">
					<app-button
						v-if="shouldShowAwardsFirstOption"
						sm
						class="-awards-first"
						:icon="ignoreAwards ? 'box-empty' : 'checkbox'"
						:to="{
							query: { page: undefined, sort: sort, 'ignore-awards': +!ignoreAwards },
						}"
					>
						<translate>Show Awards first</translate>
					</app-button>
					<translate>Sort by</translate>
					<app-popper>
						<span class="-sort">
							{{ selectedSortOption.text }}
							<app-jolticon icon="chevron-down" />
						</span>

						<template #popover>
							<div class="list-group">
								<router-link
									v-for="sortOption of sortOptions"
									:key="sortOption.sort"
									v-app-no-autoscroll
									:to="{ query: { sort: sortOption.sort, page: undefined } }"
									class="list-group-item has-addon"
								>
									<div class="list-group-item-addon">
										<app-jolticon
											v-if="selectedSortOption.sort === sortOption.sort"
											icon="check"
										/>
									</div>
									{{ sortOption.text }}
								</router-link>
							</div>
						</template>
					</app-popper>
				</span>

				<app-community-competition-entry-grid
					:competition="competition"
					:num-placeholders="numPlaceholders"
					:entries="entries"
					:current-page="page"
					:page-count="pageCount"
					:category="selectedCategory"
				/>

				<app-pagination
					v-if="pageCount > 0"
					:total-items="competition.entry_count"
					:items-per-page="perPage"
					:current-page="page"
				/>
			</div>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.-sort
	color: var(--theme-link)
	cursor: pointer

.-category-nav
	&-container
		display: flex
		margin-bottom: 24px
		flex-wrap: wrap
		rounded-corners-lg()
		overflow: hidden

	&-item
		display: block
		padding-top: 12px
		padding-bottom: 12px
		padding-right: 24px
		padding-left: 24px
		font-size: $font-size-large * 0.85
		change-bg('bg-offset')
		flex: 1
		min-width: 200px
		text-align: center
		flex-shrink: 0
		position: relative
		transition: background-color 0.2s ease

		&-active
			change-bg('bg-subtle')
			font-weight: bold

			&-bar
				position: absolute
				left: 0
				right: 0
				bottom: 0
				height: $border-width-large * 2
				change-bg('bi-bg')

.-awards-first
	margin-bottom: 3px
	margin-right: 16px
</style>
