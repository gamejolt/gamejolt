<script lang="ts" src="./grid"></script>

<template>
	<div>
		<p class="text-muted small">
			<translate
				:translate-params="{
					count: number(pageCount),
					page: number(currentPage),
				}"
			>
				Page %{ page } of %{ count }
			</translate>
		</p>

		<app-condense-whitespace class="-grid-items">
			<div v-for="entry of entries" :key="entry.id" class="-grid-item">
				<app-community-competition-entry-thumbnail :entry="entry" />
			</div>
		</app-condense-whitespace>
	</div>
</template>

<style lang="stylus" src="./grid.styl" scoped></style>
