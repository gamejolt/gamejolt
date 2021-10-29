<script lang="ts" src="./stream"></script>

<template>
	<div
		class="-stream theme-dark"
		@mouseleave="onMouseOut"
		@mousemove="onMouseMove"
		@touchmove="onMouseMove"
		@click="onVideoClick"
	>
		<template v-if="hasVideo">
			<template v-if="videoPaused">
				<transition>
					<template v-if="!hasOverlayItems">
						<div class="-paused-indicator -click-target anim-fade-leave-shrink">
							<app-jolticon class="-paused-indicator-icon" icon="play" />
						</div>
					</template>
				</transition>
			</template>
			<template v-else-if="isLoadingVideo">
				<div class="-overlay -visible-center">
					<app-loading centered stationary no-color hide-label />
				</div>
			</template>
			<template v-else>
				<div :key="rtcUser.uid">
					<app-fireside-video
						v-if="shouldShowVideo"
						class="-video-player -click-target"
						:rtc-user="rtcUser"
					/>
					<app-fireside-desktop-audio v-if="shouldPlayDesktopAudio" :rtc-user="rtcUser" />
					<app-fireside-video-stats
						v-if="c.rtc && c.rtc.shouldShowVideoStats"
						@click.native.capture.stop
					/>
				</div>
			</template>
		</template>
		<template v-else>
			<div class="-overlay -visible-center">
				<div class="-host-wrapper">
					<app-fireside-host-thumb-indicator class="-host" :host="rtcUser" />
				</div>
			</div>
		</template>

		<div
			v-if="hasOverlayItems"
			class="-overlay"
			:class="{ '-darken': shouldShowUI }"
			@click.capture="onOverlayTap"
		>
			<template v-if="shouldShowUI">
				<div class="-overlay-inner">
					<div v-if="memberCount" class="-overlay-members">
						<translate
							:translate-n="memberCount"
							:translate-params="{ count: number(memberCount) }"
							translate-plural="%{ count } members"
						>
							%{ count } member
						</translate>
					</div>

					<div class="-overlay-playback">
						<div
							v-if="shouldShowOverlayPlayback"
							class="-overlay-playback-inner"
							@click="togglePlayback"
						>
							<app-jolticon
								class="-paused-indicator-icon"
								:icon="videoPaused ? 'play' : 'pause'"
							/>
						</div>
					</div>

					<div v-if="showOverlayHosts" class="-overlay-hosts -control">
						<app-fireside-host-list
							hide-thumb-options
							@show-popper="onHostOptionsShow"
							@hide-popper="onHostOptionsHide"
						/>
					</div>
				</div>
			</template>
		</div>

		<div
			v-if="stickerStreak && stickerStreak.count > 0"
			class="-combo"
			:class="{ '-fade': shouldShowUI }"
		>
			<div
				class="badge"
				:class="{
					'-hot-streak': stickerStreak.count >= 5,
					'-super-hot-streak': stickerStreak.count >= 10,
				}"
			>
				<translate v-if="Screen.isDesktop">STREAK</translate>
				x{{ streakCount }}
			</div>

			<img
				class="-combo-sticker"
				:class="{ '-keep-animating': shouldAnimateStreak }"
				draggable="false"
				onmousedown="return false"
				style="user-drag: none"
				:src="stickerStreak.sticker.img_url"
			/>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-stream
.-video-player
	&
	> .-overlay
		position: absolute
		top: 0
		right: 0
		bottom: 0
		left: 0
		color: var(--theme-fg)
		text-shadow: 1px 1px 3px rgba($black, 0.5)

	> .-overlay
		z-index: 1
		opacity: 0
		transition: all 200ms $strong-ease-out

		&.-darken
			opacity: 1
			background-color: rgba($black, 0.5)

.-click-target
	cursor: pointer

.-overlay-inner
	height: 100%
	width: 100%
	display: flex
	flex-direction: column
	padding: 8px 0

	> *
		flex: 1

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

.-overlay-members
	padding: 0 8px
	font-weight: bold

.-overlay-playback
	flex: auto
	display: flex
	align-items: center
	justify-content: center
	min-height: 0

	&-inner
		padding: 16px
		margin: -(@padding)

.-overlay-hosts
	display: flex
	align-items: flex-end

.-control
	&
	>>>
		user-select: none

.-paused-indicator
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	display: flex
	align-items: center
	justify-content: center

	&-icon
		font-size: 60px

.-combo
	position: absolute
	top: 16px
	right: @top
	display: inline-flex
	grid-gap: 4px
	font-weight: bold
	color: white
	align-items: center
	z-index: 2
	transition: opacity 200ms $strong-ease-out

	&.-fade
		opacity: 0.45

	&
	> *
		font-size: $font-size-base
		user-select: none
		pointer-events: none

	img
		width: 56px
		height: @width

	@media $media-mobile
		&
		> *
			font-size: $font-size-tiny

		img
			width: 24px
			height: @width

.-combo-sticker
	animation-name: new-indicator
	// Make sure this is the same, or lower, than the TS file.
	animation-duration: 1s
	animation-timing-function: $ease-in-out-back
	animation-iteration-count: 1
	animation-play-state: paused
	transform: rotate(0), scale(1)

.-keep-animating
	animation-play-state: running
	animation-iteration-count: infinite

.-hot-streak
	animation-name: hot-streak
	animation-duration: 1s
	animation-iteration-count: infinite

.-super-hot-streak
	animation-name: super-hot-streak-animation
	animation-iteration-count: infinite
	animation-duration: 4s
	animation-direction: alternate

@keyframes hot-streak
	0%
		transform: scale(1)

	50%
		transform: scale(1.1)

@keyframes new-indicator
	0%
		transform: rotate(0) scale(1)

	// Slide to the left
	30%
		transform: rotate(-25deg) scale(1.1)

	33%
		transform: rotate(-15deg) scale(1.1)

	36%
		transform: rotate(-20deg) scale(1.1)

	// Slide to the right
	63%
		transform: rotate(25deg) scale(1.1)

	66%
		transform: rotate(15deg) scale(1.1)

	69%
		transform: rotate(20deg) scale(1.1)

	// Criss cross
	100%
		transform: rotate(0deg) scale(1)

@keyframes super-hot-streak-animation
	0%
		background: orange
		color: black
		transform: scale(1)

	20%
		background: violet
		color: white
		transform: scale(1.1)

	40%
		background: blue
		color: white
		transform: scale(1)

	60%
		background: cyan
		color: black
		transform: scale(1.1)

	80%
		background: green
		color: white
		transform: scale(1)

	100%
		background: yellow
		color: black
		transform: scale(1.1)
</style>
