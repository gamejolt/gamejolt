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

		<div v-if="isLoadingVideo || !hasVideo" class="-overlay -visible-center">
			<app-loading v-if="isLoadingVideo" centered stationary no-color hide-label />
			<div v-else class="-host-wrapper">
				<app-fireside-host-thumb-indicator class="-host" :host="rtcUser" />
			</div>
		</div>

		<div
			v-if="hasOverlayItems"
			class="-overlay"
			:class="{ '-darken': shouldShowUI }"
			@mouseenter="isHoveringControls = true"
			@mouseleave="isHoveringControls = false"
		>
			<div @click.capture="onTapOverlay">
				<template v-if="shouldShowUI">
					<div v-if="viewerCount" class="-overlay-viewers">
						<translate
							:translate-n="viewerCount"
							:translate-params="{ count: number(viewerCount) }"
							translate-plural="%{ count } viewers"
						>
							%{ count } viewer
						</translate>
					</div>

					<div v-if="showHosts" class="-overlay-hosts -control">
						<app-fireside-host-list scrollable />
					</div>
				</template>
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

.-visible-center
	opacity: 1 !important
	display: flex
	align-items: center
	justify-content: center

.-host-wrapper
	width: calc(min(30%, 300px))
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

.-overlay-viewers
	position: absolute
	left: 8px
	top: 8px
	font-weight: bold

.-control
	&
	>>>
		user-select: none
</style>
