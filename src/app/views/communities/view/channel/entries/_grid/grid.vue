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

		<span class="pull-right">
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
		/>

		<app-pagination
			v-if="pageCount > 0"
			:total-items="competition.entry_count"
			:items-per-page="perPage"
			:current-page="page"
		/>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-sort
	color: var(--theme-link)
	cursor: pointer
</style>
