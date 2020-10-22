<script lang="ts" src="./video-player"></script>

<template>
	<div class="-player" @mouseleave="onMouseOut" @mouseenter="onMouseIn">
		<app-video-player-shaka :player="player" :autoplay="autoplay" />

		<div class="-bottom">
			<div class="-bottom-gradient">
				<div class="-bottom-controls" @click.stop>
					<transition name="fade">
						<div
							v-if="shouldShowUI"
							class="player-control-button"
							@click="onClickPlayback"
						>
							<app-jolticon :icon="player.state === 'playing' ? 'pause' : 'play'" />
						</div>
					</transition>

					<transition-group name="fade" class="-transitions-group">
						<div
							v-for="control of ['bars', 'volume']"
							:key="control"
							class="-transitions"
						>
							<template v-if="control === 'bars'">
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
									v-if="shouldShowUI"
									class="player-control-button"
									@click="onClickMute"
								>
									<app-jolticon
										:icon="player.volume > 0 ? 'audio' : 'audio-mute'"
									/>
								</div>
							</template>
						</div>
					</transition-group>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'
@import '../variables'
@import '../../../../_common/video/player/common'

.-control
	display: flex
	width: 40px
	height: @width
	justify-content: center
	align-items: center

	>>> .jolticon
		font-size: $jolticon-size * 1.25

.fade
	&-enter
	&-leave-to
		opacity: 0

	&-leave-active
		transition: opacity 250ms $strong-ease-out

.-transitions
	transition: transform 250ms $strong-ease-out, opacity 1s

	&-group
		display: inline-flex
		margin-left: auto

.-player
	position: relative
	overflow: hidden
	margin-top: $-item-padding-xs-v
	margin-left: -($-item-padding-xs)
	margin-right: -($-item-padding-xs)

	@media $media-sm-up
		margin-top: $-item-padding-v
		margin-left: -($-item-padding-container)
		margin-right: -($-item-padding-container)

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
	height: 40px
	margin-right: 8px
	padding: 8px 0

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
