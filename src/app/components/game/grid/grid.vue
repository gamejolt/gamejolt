<script lang="ts" src="./grid"></script>

<template>
	<div :id="`grid-pagination-${id}`">
		<p v-if="gamesCount" class="text-muted small">
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
				<div v-if="Screen.isDesktop && shouldShowAds" class="game-grid-ad">
					<div class="game-grid-ad-inner">
						<app-ad-widget
							size="rectangle"
							placement="content"
							:meta="{ staticSize: true }"
						/>
					</div>
				</div>

				<!--
					Keep the end div and the opening div together below. If you
					don't it will not wrap correctly in the DOM since it adds the
					space.
				-->
				<template v-for="(game, i) of processedGames">
					<div v-if="shouldShowAd(i)" :key="game.id + '-ad'" class="game-grid-ad">
						<div class="game-grid-ad-inner">
							<app-ad-widget
								size="rectangle"
								placement="content"
								:meta="{ staticSize: true }"
							/>
						</div>
					</div>
					<div :key="game.id" class="game-grid-item">
						<app-game-thumbnail
							v-app-track-event="
								eventLabel ? 'game-grid:click:' + eventLabel : undefined
							"
							:game="game"
						>
							<slot name="thumbnail-controls" :game="game" />
						</app-game-thumbnail>
					</div>
				</template>
			</app-condense-whitespace>
		</div>
	</div>
</template>

<style lang="stylus" src="./grid.styl"></style>

