<template>
	<section class="-section fill-darker">
		<div class="-heading container-xl">
			<h2 class="sans-margin clearfix">
				<app-button
					class="hidden-xs pull-right"
					trans
					:to="{
						name: 'discover.games.list._fetch',
						params: { section: null },
					}"
					v-app-track-event="`home:more-btn:browse`"
				>
					<translate>Browse All Games</translate>
				</app-button>

				<translate>Browse by Tag</translate>
			</h2>
		</div>

		<app-tag-list />

		<div class="-button visible-xs">
			<div class="container">
				<app-button
					block
					trans
					:to="{
						name: 'discover.games.list._fetch',
						params: { section: null },
					}"
					v-app-track-event="`home:more-btn:browse`"
				>
					<translate>Browse All Games</translate>
				</app-button>
			</div>
		</div>
	</section>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

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

<script lang="ts" src="./tags"></script>
