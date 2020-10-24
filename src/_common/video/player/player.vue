<script lang="ts" src="./player"></script>

<template>
	<div
		class="-player"
		tabindex="-1"
		@fullscreenchange="onFullscreenChange"
		@mouseleave="onMouseOut"
		@mousemove="onMouseMove"
		@keydown="onKeypress"
	>
		<div
			class="-video"
			:class="{
				'-paused-cursor': player.state === 'paused',
			}"
			@click="onVideoClick"
		>
			<app-video-player-shaka-lazy :player="player" :autoplay="autoplay" />
		</div>

		<transition>
			<div
				v-if="player.state === 'paused' && !player.isScrubbing"
				class="-paused-indicator anim-fade-enter-enlarge anim-fade-leave-shrink"
			>
				<app-jolticon class="-paused-indicator-icon" icon="play" />
			</div>
		</transition>

		<transition>
			<div v-if="shouldShowUI" class="-bottom -ui anim-fade-enter anim-fade-leave-down">
				<div class="-bottom-gradient">
					<div class="-bottom-controls">
						<app-player-scrubber :player="player" />

						<div class="-row">
							<app-player-playback :player="player" />
							<app-player-volume
								:player="player"
								has-slider
								@volume-down="triggerVolumeDown"
								@volume-up="triggerVolumeUp"
							/>

							<div style="flex: auto" />

							<div v-if="player.duration > 0" class="-time anim-fade-in-enlarge">
								<div class="-time-inner">
									{{ readableTime }}
								</div>
							</div>
							<app-player-fullscreen :player="player" />
						</div>
					</div>
				</div>
			</div>
		</transition>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-player
	position: relative
	overflow: hidden
	display: flex
	height: 100%

	&:focus
		outline: none

	@media $media-sm-up
		rounded-corners-lg()

.-paused-cursor
	cursor: pointer

.-video
	margin: auto

.-ui
	z-index: 1

.-paused-indicator
	pointer-events: none
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	display: flex
	align-items: center
	justify-content: center
	text-shadow: 1px 1px 3px rgba($black, 0.5)

	&-icon
		color: white
		font-size: 60px

.-bottom
	position: absolute
	left: 0
	right: 0
	bottom: 0

	&-gradient
		background-image: linear-gradient(to bottom, rgba($black, 0), rgba($black, 0.5))
		padding-top: 16px

	&-controls
		display: flex
		flex-direction: column
		padding-left: 4px
		padding-right: 4px

.-row
	display: flex

.-time
	display: inline-flex
	align-items: center
	margin-right: 8px

	&-inner
		rounded-corners()
		padding: 4px 6px
		background-color: var(--dark-theme-bg-offset)
		color: var(--dark-theme-fg)
		font-size: $font-size-small
		pointer-events: none
		user-select: none
		opacity: 0.8
</style>
