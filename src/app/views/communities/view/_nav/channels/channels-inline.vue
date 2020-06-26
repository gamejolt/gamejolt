<template>
	<nav class="-nav">
		<app-scroll-scroller horizontal thin>
			<div class="-centered">
				<app-nav-channel-cards class="-cards" />
			</div>
		</app-scroll-scroller>
	</nav>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-centered
	display: flex

.-cards
	display: inline-flex
	padding-top: $line-height-computed
	padding-left: ($grid-gutter-width-xs / 2)
	padding-right: ($grid-gutter-width-xs / 2)
	margin-left: auto
	margin-right: auto

	@media $media-sm-up
		padding-left: ($grid-gutter-width / 2)
		padding-right: ($grid-gutter-width / 2)

	>>> .community-channel-card
		margin-right: 8px
		width: 200px

		&:last-of-type
			margin-right: 0
</style>

<script lang="ts" src="./channels-inline"></script>
