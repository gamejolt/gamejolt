<script lang="ts" src="./stream-options"></script>

<template>
	<div class="-options-wrap">
		<app-popper @show="emitShowPopper" @hide="emitHidePopper">
			<div v-app-tooltip="$gettext(`Stream Options`)" class="-options">
				<app-jolticon class="-icon" icon="ellipsis-v" />
				<app-jolticon v-if="shouldShowAsMuted" class="-muted" icon="audio-mute" />
			</div>

			<template #popover>
				<div class="list-group">
					<template v-if="c.shouldShowVolumeControls">
						<h5 class="-header list-group-item has-icon">
							<app-jolticon :icon="shouldShowAsMuted ? 'audio-mute' : 'audio'" />
							<translate>Video Volume</translate>
						</h5>
						<div class="-volume list-group-item">
							<app-slider
								class="-volume-inner"
								:percent="c.desktopVolume"
								@scrub="onVolumeScrub"
							/>
						</div>
					</template>

					<template v-if="shouldShowMuteControls">
						<a v-if="shouldMute" class="list-group-item" @click="muteAll()">
							<translate>Mute All Users</translate>
						</a>
						<a v-else class="list-group-item" @click="unmuteAll()">
							<translate>Unmute All Users</translate>
						</a>
					</template>

					<template v-if="c.shouldShowStreamingOptions">
						<a
							v-if="!c.isPersonallyStreaming"
							class="list-group-item"
							@click="onClickEditStream"
						>
							<translate>Start Streaming</translate>
						</a>
						<template v-else>
							<a class="list-group-item" @click="onClickEditStream">
								<translate>Stream Settings</translate>
							</a>
							<a class="list-group-item has-icon" @click="onClickStopStreaming">
								<app-jolticon icon="remove" notice />
								<translate>Stop Streaming</translate>
							</a>
						</template>
					</template>
				</div>
			</template>
		</app-popper>
	</div>
</template>

<style lang="stylus" scoped>
@import '../common'

.-options
	position: relative

.-muted
	img-circle()
	position: absolute
	right: 0
	bottom: 0
	padding: 4px
	background-color: var(--theme-bg-subtle)
	color: var(--theme-fg)

.-volume
	display: inline-flex
	width: 100%

	&-inner
		flex: 1

.-header
	font-family: $font-family-heading
	font-size: $font-size-tiny
	font-weight: normal
	letter-spacing: 0.1em
	line-height: 1
	text-transform: uppercase
	margin-top: 0
	margin-bottom: 0
	border: 0
</style>
