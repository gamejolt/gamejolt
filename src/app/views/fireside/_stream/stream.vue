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
					<div
						v-if="!hasOverlayItems"
						class="-paused-indicator -click-target anim-fade-leave-shrink"
					>
						<app-jolticon class="-paused-indicator-icon" icon="play" />
					</div>
				</transition>
			</template>
			<template v-else-if="isLoadingVideo">
				<div class="-overlay -visible-center">
					<app-loading centered stationary no-color hide-label />
				</div>
			</template>
			<template v-else>
				<div :key="rtcUser.userId">
					<app-fireside-video class="-video-player -click-target" :rtc-user="rtcUser" />
					<app-fireside-desktop-audio v-if="shouldPlayDesktopAudio" :rtc-user="rtcUser" />
					<app-fireside-video-stats v-if="rtc.shouldShowVideoStats" @click.capture.stop />
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

					<div v-if="showHosts" class="-overlay-hosts -control">
						<app-fireside-host-list
							hide-thumb-options
							@show-popper="onHostOptionsShow"
							@hide-popper="onHostOptionsHide"
						/>
					</div>
				</div>
			</template>
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
</style>
