<script lang="ts" src="./tags"></script>

<template>
	<section class="-section fill-offset">
		<div class="-heading container-xl">
			<h2 class="sans-margin clearfix">
				<app-button
					v-app-track-event="`home:more-btn:browse`"
					class="hidden-xs pull-right"
					outline
					:to="{
						name: 'discover.games.list._fetch',
						params: { section: null },
					}"
				>
					<translate>Browse All Games</translate>
				</app-button>

				<translate>Browse Games</translate>
			</h2>
		</div>

		<app-tag-list event-cat="home" />

		<div class="-button visible-xs">
			<div class="container">
				<app-button
					v-app-track-event="`home:more-btn:browse`"
					outline
					:to="{
						name: 'discover.games.list._fetch',
						params: { section: null },
					}"
				>
					<translate>Browse All Games</translate>
				</app-button>
			</div>
		</div>
	</section>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

.-section
	padding-top: ($grid-gutter-width / 2)

	@media $media-xs
		padding-top: ($grid-gutter-width-xs / 2)

.-heading
	@media $media-xs
		text-align: center

.-button
	padding: $line-height-computed 0
	text-align: center
</style>
