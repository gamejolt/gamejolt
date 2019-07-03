<template>
	<div :id="`grid-pagination-${id}`">
		<p class="text-muted small" v-if="gamesCount">
			<translate
				:translate-n="gamesCount"
				:translate-params="{
					count: number(gamesCount),
					page: number(currentPage),
				}"
				translate-plural="Page %{ page } of %{ count } games."
			>
				Page %{ page } of %{ count } games.
			</translate>
		</p>

		<div :class="{ 'scrollable-grid': isScrollable }">
			<app-condense-whitespace class="game-grid-items">
				<div class="game-grid-ad" v-if="Screen.isDesktop && shouldShowAds">
					<div class="game-grid-ad-inner">
						<app-ad-widget size="rectangle" static-size />
						<span class="ad-label visible-lg">
							<translate>Advertisement</translate>
						</span>
					</div>
				</div>

				<!--
					Keep the end div and the opening div together below. If you
					don't it will not wrap correctly in the DOM since it adds the
					space.
				-->
				<template v-for="(game, i) of processedGames">
					<div class="game-grid-ad" v-if="shouldShowAd(i)" :key="game.id + '-ad'">
						<div class="game-grid-ad-inner">
							<app-ad-widget size="rectangle" static-size />
							<span class="ad-label visible-lg">
								<translate>Advertisement</translate>
							</span>
						</div>
					</div>
					<div class="game-grid-item" :key="game.id">
						<app-game-thumbnail
							:game="game"
							v-app-track-event="eventLabel ? 'game-grid:click:' + eventLabel : undefined"
						>
							<slot name="thumbnail-controls" :game="game" />
						</app-game-thumbnail>
					</div>
				</template>
			</app-condense-whitespace>
		</div>
	</div>
</template>

<script lang="ts" src="./grid"></script>

<style lang="stylus" src="./grid.styl"></style>

