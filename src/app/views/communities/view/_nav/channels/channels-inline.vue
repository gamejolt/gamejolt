<template>
	<nav class="-nav">
		<app-scroll-scroller class="-scroller" horizontal thin>
			<app-nav-channel-cards class="-cards" />
		</app-scroll-scroller>
	</nav>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-scroller
	padding-top: $line-height-computed
	padding-left: ($grid-gutter-width-xs / 2)
	padding-right: ($grid-gutter-width-xs / 2)

	@media $media-sm-up
		padding-left: ($grid-gutter-width / 2)
		padding-right: ($grid-gutter-width / 2)

.-cards
	display: flex

	>>> .community-channel-card
		margin-right: 8px
		width: 200px
</style>

<script lang="ts" src="./channels-inline"></script>
