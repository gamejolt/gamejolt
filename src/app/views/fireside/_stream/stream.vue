<script lang="ts" src="./stream"></script>

<template>
	<div
		class="-video"
		@mouseleave="onMouseOut"
		@mousemove="onMouseMove"
		@touchmove="onMouseMove"
		@click="onVideoClick"
	>
		<template v-if="hasVideo">
			<template v-if="videoPaused">
				<transition>
					<div class="-paused-indicator anim-fade-leave-shrink">
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
				<app-fireside-video class="-video-player" :rtc-user="rtcUser" />
				<app-fireside-desktop-audio v-if="shouldPlayDesktopAudio" :rtc-user="rtcUser" />
				<app-fireside-video-stats v-if="rtc.shouldShowVideoStats" />
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
			@mouseenter="isHoveringControls = true"
			@mouseleave="isHoveringControls = false"
		>
			<div @click.capture="onTapOverlay">
				<template v-if="shouldShowUI">
					<div v-if="memberCount" class="-overlay-members">
						<translate
							:translate-n="memberCount"
							:translate-params="{ count: number(memberCount) }"
							translate-plural="%{ count } members"
						>
							%{ count } member
						</translate>
					</div>

					<div v-if="showHosts" class="-overlay-hosts -control">
						<app-fireside-host-list />
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

.-overlay-members
	position: absolute
	left: 8px
	top: 8px
	font-weight: bold

.-control
	&
	>>>
		user-select: none

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
</style>
