<script lang="ts" src="./grid"></script>

<template>
	<div>
		<h2 class="sans-margin-top">
			<translate
				:translate-n="competition.entry_count"
				:translate-params="{
					count: number(competition.entry_count),
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
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

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
</style>
