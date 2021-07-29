<script lang="ts" src="./video"></script>

<template>
	<div
		class="-video"
		@mouseleave="onMouseOut"
		@mousemove="onMouseMove"
		@touchmove="onMouseMove"
		@click="onVideoClick"
	>
		<div ref="player" class="-video-player" />

		<template v-if="isLoadingVideo">
			<app-loading centered stationary no-color hide-label />
		</template>
		<template v-else-if="!hasVideo">
			<div class="-overlay -host-overlay">
				<div class="-host-wrapper">
					<app-fireside-host-thumb-indicator class="-host" :host="rtcUser" />
				</div>
			</div>
		</template>

		<div
			v-if="hasOverlayItems"
			class="-overlay"
			:class="{ '-darken': shouldShowUI }"
			@mouseenter="isHoveringControls = true"
			@mouseleave="isHoveringControls = false"
		>
			<div @click.stop>
				<div v-if="showHosts" class="-overlay-hosts -control">
					<app-fireside-host-list scrollable />
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-video
.-video-player
	&
	> .-overlay
		position: absolute
		top: 0
		right: 0
		bottom: 0
		left: 0

	> .-overlay
		z-index: 1
		opacity: 0
		transition: all 200ms $strong-ease-out

		&.-darken
			opacity: 1
			background-color: rgba($black, 0.5)

.-host-overlay
	opacity: 1 !important
	display: flex
	align-items: center
	justify-content: center

.-host-wrapper
	width: 30%
	padding-top: @width
	position: relative

.-host
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0

.-overlay-hosts
	position: absolute
	left: 0px
	bottom: 4px
	right: 0px

.-control
	&
	>>>
		user-select: none
</style>
