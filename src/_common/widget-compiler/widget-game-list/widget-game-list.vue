<template>
	<div class="widget-compiler-widget-game-list" :class="contentClass">
		<div class="-game-list">
			<a class="-game" v-for="game of games" :key="game.id" :href="url(game)">
				<app-game-thumbnail-img animate :game="game" />
				<div class="-title">{{ game.title }}</div>
			</a>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.-game-list
	text-align: center

	@media $media-sm-up
		margin-left: -(20px)
		margin-right: -(20px)

.-game
	display: inline-block
	vertical-align: top
	text-align: left
	width: 100%
	padding-bottom: $grid-gutter-width-xs

	@media $media-sm
		width: (100% / 2)
		padding: 0 20px 40px 20px

	@media $media-md-up
		width: (100% / 3)
		padding: 0 20px 40px 20px

.-title
	margin: 10px 0 0 0
	font-weight: bold
	font-size: 1.1em
</style>

<script lang="ts" src="./widget-game-list"></script>
