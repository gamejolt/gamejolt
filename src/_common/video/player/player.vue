<script lang="ts" src="./player"></script>

<template>
	<div
		class="-player"
		tabindex="-1"
		:class="{ '-fullscreen': player.isFullscreen }"
		@fullscreenchange="onFullscreenChange"
		@mouseleave="onMouseOut"
		@mousemove="onMouseMove"
		@keydown="onKeypress"
	>
		<app-responsive-dimensions
			class="-video-container"
			:class="{ '-with-stats': shouldShowVideoStats }"
			:style="{ minWidth: blackBarsBreakpoint || 'unset' }"
			:ratio="mediaItem.width / mediaItem.height"
			:max-width="playerMaxWidth"
			:max-height="deviceMaxHeight"
			@change="onChangeDimensions"
		>
			<div
				class="-content-container"
				:class="{
					'-paused-cursor': player.state === 'paused',
				}"
				@click="onVideoClick"
			>
				<app-video-player-shaka-lazy
					v-if="player && !GJ_IS_SSR"
					class="-video"
					:style="{ width }"
					:player="player"
					:autoplay="autoplay"
				/>

				<!--
				This will show behind the video so that we can switch to it while
				the video is loading and when it's unfocused/not active.
				-->
				<app-media-item-backdrop
					class="-backdrop"
					:style="{ height, width, position: GJ_IS_SSR ? 'relative' : null }"
					:media-item="mediaItem"
				>
					<app-img-responsive
						class="-img"
						:style="{ width }"
						:src="mediaItem.mediaserver_url"
						alt=""
					/>
				</app-media-item-backdrop>

				<transition>
					<div
						class="-overlay -ui"
						:class="{
							'-paused-cursor': player.state === 'paused',
							'-darken': shouldShowLoading,
						}"
						@click="onVideoClick"
					>
						<app-loading v-if="shouldShowLoading" no-color hide-label stationary />
						<template v-else>
							<transition>
								<div
									v-if="shouldShowPausedIndicator"
									class="-paused-indicator -ui anim-fade-enter-enlarge anim-fade-leave-shrink"
								>
									<app-jolticon class="-paused-indicator-icon" icon="play" />
								</div>
							</transition>
						</template>
					</div>
				</transition>

				<transition>
					<div
						v-if="shouldShowUI"
						class="-bottom -ui anim-fade-enter anim-fade-leave-down"
						@mouseenter="isHoveringControls = true"
						@mouseleave="isHoveringControls = false"
						@click.stop
					>
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

									<div
										v-if="player.duration > 0"
										class="-time anim-fade-in-enlarge"
									>
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

			<div v-if="shouldShowVideoStats" class="-video-stats">
				<span v-app-tooltip.touchable="$gettext(`Plays`)">
					<app-jolticon icon="play" />
					<span class="-video-stats-label">
						{{ number(viewCount) }}
					</span>
				</span>
			</div>
		</app-responsive-dimensions>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

$-zindex-backdrop = 0
$-zindex-video = 1
$-zindex-ui = 2

.-fullscreen
	.-video-container
		width: 100vw !important
		height: 100vh !important

.-player
	position: relative
	height: 100%
	min-width: 100%
	display: flex
	flex-direction: column
	align-items: center

	&:focus
		outline: none

.-video-container
	position: relative

	&.-with-stats
		margin-bottom: 24px

	&:hover
		.-time-inner
			background-color: rgba($black, 1)

.-content-container
	height: 100%
	background-color: $black
	display: flex
	justify-content: center
	align-items: center
	position: relative
	overflow: hidden

	@media $media-sm-up
		rounded-corners-lg()

.-paused-cursor
	cursor: pointer

.-video
	position: relative
	margin: auto
	z-index: $-zindex-video

.-overlay
	position: absolute
	top: 0
	left: 0
	width: 100%
	height: 100%
	display: flex
	justify-content: center
	align-items: center

	&.-darken
		background-color: rgba($black, 0.5)

.-ui
	z-index: $-zindex-ui

.-backdrop
	position: absolute
	z-index: $-zindex-backdrop

.-img
	max-height: 100%

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
		background-color: rgba($black, 0.4)
		color: var(--dark-theme-fg)
		font-size: $font-size-small
		pointer-events: none
		user-select: none
		transition: background-color 250ms $strong-ease-out

.-video-stats
	position: absolute
	top: calc(100% + 4px)
	right: 0
	font-weight: bold

	> span
		display: inline-flex
		align-items: center

	@media $media-xs
		margin-right: ($grid-gutter-width-xs / 2)

	&-label
		margin-left: 4px
</style>
