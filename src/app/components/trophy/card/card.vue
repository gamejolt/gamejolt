<template>
	<div class="-trophy-card sheet sheet-no-full-bleed">
		<div class="-bg" :class="mainClass"></div>
		<div class="-content">
			<strong class="-title">{{ trophy.title }}</strong>
			<div class="-subline">
				<small class="text-muted">
					<app-jolticon icon="game" />
					<span>Game Trophy</span>
				</small>
			</div>
			<div class="-thumbnail">
				<app-trophy-thumbnail :trophy="trophy" />
			</div>
			<div class="-description">
				<small class="text-muted">{{ trophy.description }}</small>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-trophy-card
	max-width: 240px
	height: 280px
	position: relative
	overflow: hidden

	&:hover
		elevate-2()

.-bg
	position: absolute
	top: 0
	left: 0
	right: 0
	bottom: 0
	z-index: 1

.-content
	position: relative
	z-index: 2

.-trophy-difficulty-1
	background: linear-gradient(rgba(248, 198, 143, 0.3) 0%, transparent 30%)

.-trophy-difficulty-2
	background: linear-gradient(rgba(207, 207, 207, 0.3) 0%, transparent 30%)

.-trophy-difficulty-3
	background: linear-gradient(rgba(255, 207, 39, 0.3) 0%, transparent 30%)

.-trophy-difficulty-4
	background: linear-gradient(rgba(176, 205, 217, 0.3) 0%, transparent 30%)

.-title
	width: 100%
	display: inline-block
	text-align: center

.-subline
	width: 100%
	text-align: center
	margin-bottom: 10px

	& *
		vertical-align: middle

.-thumbnail
	display: flex
	justify-content: center

	& > *
		width: 100px

.-description
	margin-top: 10px
	text-align: center

</style>

<script lang="ts" src="./card"></script>
