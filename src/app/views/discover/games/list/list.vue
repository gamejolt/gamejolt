<script lang="ts" src="./list"></script>

<template>
	<div>
		<section v-if="section !== 'by-date'" class="fill-offset">
			<div class="container-xl">
				<h2 class="text-center">
					<translate>Browse Games</translate>
				</h2>
			</div>
			<app-tag-list />
		</section>

		<app-expand v-if="Screen.isDesktop" :when="isHome">
			<app-game-add-banner />
		</app-expand>

		<app-game-listing
			v-if="listing"
			:listing="listing"
			:filtering="filtering"
			include-featured-section
			:hide-section-nav="section === 'by-date'"
			:is-loading="isRouteLoading"
			infinite
			@load="loadMore"
		>
			<div v-if="section === 'new'" class="alert alert-info anim-fade-in-enlarge">
				<translate>
					Newly added games are not moderated, curated, or vetted by the community. You
					can find a goldmine of undiscovered talent or you may see some of the scariest
					shit of your life.
				</translate>
			</div>

			<app-game-grid :games="listing.games" :show-ads="true" event-label="browse-games" />
		</app-game-listing>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

$-spotlight-size = 58px

.-list-desc
	margin-top: 4px

@media $media-sm-up
	.-spotlight
		float: left
		width: $-spotlight-size
		height: $-spotlight-size

	.-has-spotlight .-header-content
		margin-left: $-spotlight-size + $grid-gutter-width
</style>
