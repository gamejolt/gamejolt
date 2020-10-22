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
							<app-player-fullscreen class="-fullscreen" :player="player" />
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

	&:focus
		outline: none

	@media $media-sm-up
		rounded-corners-lg()

.-paused-cursor
	cursor: pointer

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

.-fullscreen
	margin-left: auto
</style>
