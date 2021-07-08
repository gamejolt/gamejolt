<script lang="ts" src="./video"></script>

<template>
	<div class="-video" @mouseleave="onMouseOut" @mousemove="onMouseMove" @click="onVideoClick">
		<div ref="player" class="-video-player" />
		<div
			v-if="hasOverlayItems"
			class="-overlay"
			:class="{ '-darken': shouldShowUI }"
			@mouseenter="isHoveringControls = true"
			@mouseleave="isHoveringControls = false"
		>
			<div @click.stop>
				<div v-if="showHosts" class="-overlay-hosts -control">
					<app-fireside-host-list />
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

.-overlay-hosts
	position: absolute
	left: 4px
	bottom: 4px
	right: 4px

.-control
	&
	>>>
		user-select: none
</style>
