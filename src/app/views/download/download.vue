<script lang="ts" src="./download"></script>

<template>
	<section v-if="isRouteBootstrapped" class="-section section">
		<app-ad-widget
			v-if="!Screen.isMobile"
			class="-leaderboard-ad"
			size="leaderboard"
			placement="top"
		/>

		<app-page-container xl>
			<template v-if="Screen.isDesktop" #left>
				<app-scroll-affix>
					<app-ad-widget size="rectangle" placement="side" />
				</app-scroll-affix>
			</template>
			<template v-if="Screen.isLg" #right>
				<app-scroll-affix>
					<app-ad-widget size="rectangle" placement="side" />
				</app-scroll-affix>
			</template>
			<template #default>
				<app-game-badge :game="game" full-bleed />

				<h2 class="section-header">
					<template v-if="type === 'build'">
						<translate :translate-params="{ game: game.title }">
							Downloading %{ game }...
						</translate>
					</template>
					<template v-else-if="type === 'soundtrack'">
						<translate :translate-params="{ game: game.title }">
							Downloading soundtrack for %{ game }...
						</translate>
					</template>
				</h2>

				<p class="small text-muted">
					<translate> Your download will begin in just a moment... </translate>
				</p>

				<!--
				Set visibility so that the page height doesn't change when we
				hide. We don't want to change if they're trying to click
				something.
				-->
				<div :style="{ visibility: started ? 'hidden' : undefined }">
					<app-loading :hide-label="true" />
					<br />
				</div>

				<app-ad-widget size="video" placement="content" />

				<h2>
					<translate>game.download.game.recommended_heading</translate>
				</h2>

				<div class="scrollable-grid-xs">
					<div class="row">
						<div
							v-for="game of games"
							:key="game.id"
							class="scrollable-grid-item col-xs-10 col-sm-6"
						>
							<app-game-thumbnail
								v-app-track-event="'recommended-games:click:download'"
								:game="game"
							/>
						</div>
					</div>
				</div>
			</template>
		</app-page-container>
	</section>
</template>

<style lang="stylus" scoped>
// We want to keep the top part as thin as possible.
.-section
	padding-top: $line-height-computed

.-leaderboard-ad
	margin-bottom: $line-height-computed * 2
</style>
