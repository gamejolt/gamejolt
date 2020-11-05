<script lang="ts" src="./video-player"></script>

<template>
	<app-scroll-inview
		class="-player theme-dark"
		:config="InviewConfigFocused"
		:controller="focusedController"
		@mouseleave.native="onMouseOut"
		@mouseenter.native="onMouseIn"
	>
		<app-responsive-dimensions
			class="-video-container"
			:ratio="mediaItem.width / mediaItem.height"
			:max-height="maxPlayerHeight"
			@change="onChangeDimensions"
		>
			<div class="-content-container">
				<app-video-player-shaka-lazy
					v-if="player && !GJ_IS_SSR"
					class="-video"
					:player="player"
					:autoplay="shouldAutoplay"
					allow-degraded-autoplay
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
			</div>
		</app-responsive-dimensions>

		<div v-if="player" class="-bottom" @click.stop>
			<div class="-bottom-gradient">
				<div class="-bottom-controls">
					<transition name="fade">
						<div
							v-if="shouldShowPlaybackControl"
							class="-control"
							@click="onClickPlayback"
						>
							<app-jolticon :icon="player.state === 'playing' ? 'pause' : 'play'" />
						</div>
					</transition>

					<transition-group name="fade" class="-transitions-group">
						<div
							v-for="control of ['time', 'bars', 'volume']"
							:key="control"
							class="-transitions"
						>
							<template v-if="player">
								<template v-if="control === 'time'">
									<transition name="fade">
										<div
											v-if="player.state === 'playing' && player.duration > 0"
											class="-time"
										>
											<div class="-time-inner">
												{{ remainingTime }}
											</div>
										</div>
									</transition>
								</template>
								<template v-else-if="control === 'bars'">
									<transition name="fade">
										<div v-if="player.state === 'playing'" class="-bars">
											<div class="-bar -bar-1" />
											<div class="-bar -bar-2" />
											<div class="-bar -bar-3" />
										</div>
									</transition>
								</template>
								<template v-else-if="control === 'volume'">
									<div
										v-if="shouldShowMuteControl"
										class="-control"
										@click="onClickMute"
									>
										<app-jolticon
											:icon="player.volume > 0 ? 'audio' : 'audio-mute'"
										/>
									</div>
								</template>
							</template>
						</div>
					</transition-group>
				</div>
			</div>
		</div>
	</app-scroll-inview>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'
@import '../variables'
@import '../../../../_common/video/player/common'

$-controls-height = 48px
$-controls-spacing = 8px

.-ssr
	display: flex
	justify-content: center
	align-items: center

	> .jolticon
		position: absolute
		font-size: $jolticon-size * 10
		filter: drop-shadow(0 0 6px $black)

.-player
	position: relative
	overflow: hidden
	height: 100%
	width: 100%

	&:hover
		.-time-inner
			background-color: rgba($black, 1)

.-video-container
	position: relative
	// Overrides the 'width' styling, allowing us to add borders to the sides of videos and image placeholders.
	min-width: 100%

.-content-container
	height: 100%
	background-color: $black
	display: flex
	justify-content: center

.-video
	z-index: 1

.-backdrop
	position: absolute
	top: 0
	z-index: 0

.-img
	max-height: 100%

.-control
	display: inline-flex
	justify-content: center
	align-items: center
	width: $-controls-height
	height: @width

	>>> .jolticon
		font-size: $jolticon-size * 1.5
		color: $white

.-time
	display: inline-flex
	justify-content: center
	align-items: center
	margin-right: $-controls-spacing
	height: $-controls-height

	&-inner
		rounded-corners()
		background-color: rgba($black, 0.4)
		color: var(--dark-theme-fg)
		padding: 4px 8px
		font-size: $font-size-small
		transition: background-color 250ms $strong-ease-out

.fade
	&-enter
	&-leave-to
		opacity: 0
		visibility: hidden

	&-leave-active
		transition: opacity 250ms $strong-ease-out, visibility 250ms

.-transitions
	transition: transform 250ms $strong-ease-out, opacity 1s

	&-group
		display: inline-flex
		margin-left: auto

.-bottom
	position: absolute
	left: 0
	right: 0
	bottom: 0
	z-index: 1

	&-gradient
		background-image: linear-gradient(to bottom, rgba($black, 0), rgba($black, 0.5))
		padding-top: 16px

	&-controls
		display: flex
		padding-left: 4px
		padding-right: 4px

.-bars
	display: inline-flex
	align-items: center
	margin-right: $-controls-spacing
	height: $-controls-height
	padding: ($-controls-height / 3) 0

	.-bar
		rounded-corners()
		display: inline-block
		width: 4px
		height: 20%
		margin: 0 2px
		background-color: var(--theme-highlight)
		animation-name: sound-indicator
		animation-iteration-count: infinite
		animation-timing-function: linear

		&-1
			animation-delay: 0ms
			animation-duration: 2.3s

		&-2
			animation-delay: -690ms
			animation-direction: reverse
			animation-duration: 3s

		&-3
			animation-delay: -420ms
			animation-duration: 3.4s

@keyframes sound-indicator
	0%
		height: 20%

	10%
		height: 60%

	20%
		height: 40%

	30%
		height: 80%

	40%
		height: 40%

	50%
		height: 60%

	60%
		height: 20%

	70%
		height: 80%

	80%
		height: 40%

	90%
		height: 60%

	100%
		height: 20%
</style>
