<template>
	<div class="-container">
		<div
			class="-trophy-card sheet sheet-no-full-bleed"
			:class="{ '-trophy-new': isNew }"
			@click="onClick"
		>
			<div class="-background">
				<div class="-bg" :class="bgClass"></div>
				<div class="-bg-gradient"></div>
			</div>
			<div class="-content">
				<strong class="-title" :title="trophy.title">{{ trophy.title }}</strong>
				<div class="-subline">
					<small class="text-muted">
						<template v-if="isGame">
							<app-jolticon icon="game" />
							<span>Game Trophy</span>
						</template>
						<template v-else>
							<app-jolticon icon="gamejolt" />
							<span>Game Jolt Trophy</span>
						</template>
					</small>
				</div>
				<div class="-thumbnail">
					<app-trophy-thumbnail :trophy="trophy" no-tooltip />
				</div>
				<div class="-description">
					<app-fade-collapse :collapse-height="64">
						<small class="text-muted">{{ trophy.description }}</small>
					</app-fade-collapse>
				</div>
			</div>
		</div>
		<div v-if="isNew" class="-new-notice">
			<app-jolticon icon="exclamation-circle" notice big />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-container
	position: relative

.-trophy-card
	max-width: 240px
	height: 280px
	position: relative
	overflow: hidden
	cursor: pointer

	&:hover
		elevate-2()

.-trophy-new
	border-color: var(--theme-notice)

.-background
	display: flex
	justify-content: center
	align-items: center

.-bg
	position: absolute
	width: 200%
	height: 200%
	z-index: 1
	transform: rotateZ(30deg)
	background-image: url('../pattern.png')

.-trophy-difficulty-1
	background-color: rgba(248, 198, 143, 0.3)

.-trophy-difficulty-2
	background-color: rgba(207, 207, 207, 0.3)

.-trophy-difficulty-3
	background-color: rgba(255, 207, 39, 0.3)

.-trophy-difficulty-4
	background-color: rgba(176, 205, 217, 0.3)

.-bg-gradient
	position: absolute
	top: 0
	left: 0
	right: 0
	bottom: 0
	z-index: 2
	background: linear-gradient(transparent 0%, var(--theme-bg-actual) 40%)

.-content
	position: relative
	z-index: 3

.-title
	width: 100%
	display: inline-block
	text-align: center
	text-overflow()

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
	word-break: break-word

.-new-notice
	position: absolute
	top: -16px
	left: -18px
	z-index: 4

	& > span
		background-color: var(--theme-bg)
		border-radius: 50%

</style>

<script lang="ts" src="./card"></script>
