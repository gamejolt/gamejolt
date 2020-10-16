<script lang="ts" src="./player"></script>

<template>
	<div
		class="-player"
		@fullscreenchange="onFullscreenChange"
		@mouseleave="onMouseOut"
		@mousemove="onMouseMove"
		@keydown="onKeypress"
	>
		<div class="-video" @click="onVideoClick">
			<app-video-player-shaka :player="player" />
		</div>

		<transition>
			<div v-if="shouldShowUI" class="-bottom -ui anim-fade-enter anim-fade-leave">
				<div class="-bottom-gradient">
					<div class="-bottom-controls">
						<app-player-scrubber :player="player" />

						<div class="-row">
							<app-player-playback :player="player" />
							<app-player-volume
								:player="player"
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
	rounded-corners-lg()
	position: relative
	overflow: hidden

.-ui
	z-index: 1

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
