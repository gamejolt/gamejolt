<script lang="ts" src="./host-thumb"></script>

<template>
	<div v-app-tooltip="tooltip" class="-thumb">
		<div class="-click-capture" @click="onClick">
			<div class="-display-thumb" :class="{ '-hidden': !showingVideoThumb }">
				<template v-if="showingVideoThumb">
					<app-fireside-video v-if="!rtc.videoPaused" :rtc-user="host" low-bitrate />
					<app-jolticon v-else icon="camera" class="-display-thumb-icon" />
				</template>
			</div>

			<div class="-avatar-wrap" :class="{ '-full': !showingVideoThumb }">
				<app-fireside-host-thumb-indicator :host="host" />
			</div>

			<div class="-spacer" />
			<div class="-active-indicator" :class="{ '-active': isFocused }" />
		</div>

		<div class="-options">
			<transition>
				<span
					v-if="host.micAudioMuted"
					v-app-tooltip="$gettext(`Muted`)"
					class="-option -option-warn anim-fade-enter-enlarge anim-fade-leave-shrink"
				>
					<app-jolticon icon="audio-mute" />
				</span>
			</transition>

			<div class="-options-spacer" />

			<app-popper
				v-if="!hideOptions"
				placement="top"
				@show="emitShowPopper"
				@hide="emitHidePopper"
			>
				<a v-app-tooltip="$gettext('Options')" class="-option -option-show-hover">
					<app-jolticon icon="cog" />
				</a>

				<template #popover>
					<div class="list-group">
						<a v-if="!host.micAudioMuted" class="list-group-item" @click="mute()">
							<translate>Mute</translate>
						</a>
						<a v-else class="list-group-item" @click="unmute()">
							<translate>Unmute</translate>
						</a>
					</div>
				</template>
			</app-popper>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-thumb
.-click-capture
	position: relative
	width: var(--fireside-host-size)
	height: var(--fireside-host-size)

.-click-capture
	display: flex
	flex-direction: column
	align-items: center
	cursor: pointer
	user-select: none

.-display-thumb
	rounded-corners()
	flex: auto
	display: flex
	align-items: center
	justify-content: center
	width: 100%
	background-color: var(--theme-bg-subtle)
	overflow: hidden

	&.-hidden
		visibility: hidden

.-stream-player
	width: 100%
	height: 100%

.-avatar-wrap
	position: absolute
	width: calc(var(--fireside-host-size) * 0.5)
	height: calc(var(--fireside-host-size) * 0.5)
	bottom: 0
	transition: all 250ms $strong-ease-out

	&.-full
		width: calc(var(--fireside-host-size) - 12px)
		height: calc(var(--fireside-host-size) - 12px)
		bottom: 12px

.-spacer
	flex: none
	height: calc(var(--fireside-host-size) * 0.3)

.-active-indicator
	flex: none
	border-radius: 40%
	height: 4px
	width: 0
	opacity: 0
	background-color: var(--theme-link)
	transition: width 400ms $ease-out-back, opacity 250ms

	&.-active
		width: 30px
		opacity: 1

.-options
	position: absolute
	display: flex
	flex-direction: row
	justify-content: flex-end
	bottom: 8px
	left: 8px
	right: 8px
	grid-gap: 4px

	&-spacer
		flex: auto

.-option
	flex: none
	elevate-1()
	img-circle()
	display: flex
	width: 24px
	height: 24px
	background-color: var(--theme-bg)
	align-items: center
	justify-content: center
	color: var(--theme-fg)
	cursor: default

	a&
		cursor: pointer

		&:hover
			color: var(--theme-bi-fg)
			background-color: var(--theme-bi-bg)

	&-warn
		color: var(--theme-notice)

.-option-show-hover
	display: none

.-thumb:hover
	.-option-show-hover
		display: flex
</style>
