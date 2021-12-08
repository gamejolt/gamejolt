<script lang="ts" src="./grid"></script>

<template>
	<div>
		<p v-if="pageCount > 0 && currentPage > 0" class="text-muted small">
			<translate
				:translate-params="{
					count: formatNumber(pageCount),
					page: formatNumber(currentPage),
				}"
			>
				Page %{ page } of %{ count }
			</translate>
		</p>

		<app-condense-whitespace class="-grid-items">
			<template v-if="entries.length > 0">
				<div v-for="entry of entries" :key="entry.id" class="-grid-item">
					<app-community-competition-entry-thumbnail
						:entry="entry"
						:show-rank="shouldShowThumbnailRanks"
						:voting-category="category"
						:show-awards="shouldShowThumbnailAwards"
						:show-remove="showRemove"
						@remove="emitRemove(entry)"
					/>
				</div>
			</template>
			<template v-else>
				<div
					v-for="i of placeholderCount"
					:key="i"
					class="-grid-item -grid-item-placeholder"
				>
					<div class="-grid-item-placeholder-part -grid-item-placeholder-thumb">
						<div
							v-if="shouldShowThumbnailRanks"
							class="-grid-item-placeholder-overlay"
						/>
					</div>
					<div class="-grid-item-placeholder-part -grid-item-placeholder-name" />
					<div class="-grid-item-placeholder-part -grid-item-placeholder-user" />
				</div>
			</template>
		</app-condense-whitespace>
	</div>
</template>

<style lang="stylus" src="./grid.styl" scoped></style>
