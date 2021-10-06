<script lang="ts" src="./setup"></script>

<template>
	<app-loading-fade :is-loading="isStarting">
		<a class="-intro" href="https://gamejolt.com/p/fgjtydpu" @click="openHelpLink">
			<div class="-intro-subtitle">
				<translate>Voice chat and livestream on Game Jolt with your friends!</translate>
			</div>
			<div class="-intro-title">
				<translate>Read the setup guide to get started</translate>
			</div>
		</a>

		<app-form ref="form" name="streamSetupForm">
			<!-- <app-form-legend compact>
					<translate>Voice Chat</translate>
				</app-form-legend> -->

			<template v-if="canStreamAudio">
				<app-form-group name="tempSelectedMicDeviceId" :label="$gettext('Microphone')">
					<template v-if="!hasMicPermissions">
						<div class="alert" :class="{ 'alert-notice': micPermissionsWerePrompted }">
							<p>
								<translate>
									We need access to your inputs in order to stream your audio.
								</translate>
							</p>
							<app-button
								v-if="!micPermissionsWerePrompted"
								@click="onClickPromptMicPermissions"
							>
								<translate>Request Permission</translate>
							</app-button>
							<p v-else>
								<strong>
									<translate>
										Click the lock icon next to the URL in your address bar to
										enable. You may need to open this window again or refresh
										the page to renew your devices.
									</translate>
								</strong>
							</p>
						</div>
					</template>
					<template v-else>
						<div class="alert">
							<p>
								<translate>
									Microphone is optional if you don't want people to hear you.
								</translate>
							</p>
						</div>

						<app-form-control-select
							:disabled="producer.isBusy"
							class="-mic-input"
							:class="{ '-hide-indicator': !hasMicAudio }"
						>
							<option
								:value="PRODUCER_UNSET_DEVICE"
								:disabled="wouldInvalidateIfRemoved('selectedMicDeviceId')"
							>
								<translate>Not Set</translate>
							</option>

							<option
								v-for="mic of mics"
								:key="mic.deviceId"
								:value="mic.deviceId"
								:disabled="
									mic.groupId === selectedDesktopAudioGroupId
										? !canSwapAudioInputs
										: false
								"
							>
								{{
									mic.groupId === selectedDesktopAudioGroupId
										? `[${$gettext('Desktop Audio')}] `
										: ''
								}}
								{{ mic.label }}
							</option>
						</app-form-control-select>

						<app-volume-meter
							v-if="hasMicAudio"
							class="-volume-meter"
							:producer="producer"
							type="mic"
						/>

						<app-expand :when="hasMicAudio">
							<p class="help-block">
								<translate>
									The volume meter should only move when you're speaking. If it's
									moving with the sounds your device is making, you've chosen the
									wrong input.
								</translate>
							</p>
						</app-expand>
					</template>
				</app-form-group>

				<app-form-group
					name="tempSelectedGroupAudioDeviceId"
					:label="$gettext('Audio Output Device')"
				>
					<template v-if="!hasSpeakerPermissions">
						<div
							class="alert"
							:class="{ 'alert-notice': speakerPermissionsWerePrompted }"
						>
							<p>
								<translate>
									To hear the other people streaming with you, we'll need access
									to your output device so that we can pipe their beautiful voices
									into your earholes.
								</translate>
							</p>

							<app-button
								v-if="!speakerPermissionsWerePrompted"
								@click="onClickPromptSpeakerPermissions"
							>
								<translate>Request Permission</translate>
							</app-button>
							<p v-else>
								<strong>
									<translate>
										Click the lock icon next to the URL in your address bar to
										enable. You may need to open this window again or refresh
										the page to renew your devices.
									</translate>
								</strong>
							</p>
						</div>
					</template>
					<template v-else>
						<app-form-control-select :disabled="producer.isBusy">
							<option
								v-for="speaker of speakers"
								:key="speaker.deviceId"
								:value="speaker.deviceId"
							>
								{{ speaker.label }}
							</option>
						</app-form-control-select>
					</template>
				</app-form-group>
			</template>

			<template v-if="canStreamVideo">
				<app-form-group name="selectedWebcamDeviceId" :label="$gettext('Video Source')">
					<template v-if="!hasWebcamPermissions">
						<div
							class="alert"
							:class="{ 'alert-notice': webcamPermissionsWerePrompted }"
						>
							<p>
								<translate>
									To stream video we need access to your video source/camera.
								</translate>
							</p>
							<app-button
								v-if="!webcamPermissionsWerePrompted"
								@click="onClickPromptWebcamPermissions"
							>
								<translate>Request Permission</translate>
							</app-button>
							<p v-else>
								<strong>
									<translate>
										Click the lock icon next to the URL in your address bar to
										enable. You may need to open this window again or refresh
										the page to renew your devices.
									</translate>
								</strong>
							</p>
						</div>
					</template>
					<template v-else>
						<div class="alert">
							<p>
								<translate>
									Video source is optional if you just want to voice chat.
								</translate>
							</p>
						</div>

						<app-form-control-select :disabled="producer.isBusy">
							<option
								:value="PRODUCER_UNSET_DEVICE"
								:disabled="wouldInvalidateIfRemoved('selectedWebcamDeviceId')"
							>
								<translate>Not Set</translate>
							</option>

							<option
								v-for="webcam of webcams"
								:key="webcam.deviceId"
								:value="webcam.deviceId"
							>
								{{ webcam.label }}
							</option>
						</app-form-control-select>

						<p class="help-block">
							<translate>
								You can use the virtual camera in OBS or Streamlabs to capture your
								gameplay and make it available for streaming on Game Jolt.
							</translate>

							<br />

							<a href="https://gamejolt.com/p/3pt3kxnn" @click="openHelpLink">
								<translate> Learn how to stream your gameplay or screen </translate>
							</a>
						</p>

						<div
							ref="videoPreview"
							class="-video-preview"
							:class="{
								'-hidden': !hasWebcam,
							}"
						/>
					</template>
				</app-form-group>
			</template>

			<!-- Only show this section if they've given mic permissions -->
			<fieldset v-if="canStreamAudio && hasMicPermissions">
				<app-form-legend
					v-if="shouldShowAdvanced || !isInvalidConfig"
					compact
					:expandable="!hasDesktopAudio"
					:expanded="shouldShowAdvanced"
					@click.native="onToggleAdvanced"
				>
					<translate>Advanced Settings</translate>
				</app-form-legend>

				<app-expand :when="shouldShowAdvanced || hasDesktopAudio" class="full-bleed">
					<div class="-desktop-well well sans-rounded fill-offset">
						<app-form-group
							name="tempSelectedDesktopAudioDeviceId"
							class="sans-margin-bottom"
							:label="$gettext('Desktop Audio')"
						>
							<p class="help-block">
								<translate>
									Streaming desktop audio requires the set up of a virtual audio
									cable in order to split the audio of your game/desktop from the
									audio of the other people in the stream.
								</translate>

								<br />

								<a href="https://gamejolt.com/p/fcqbv3ff" @click="openHelpLink">
									<translate>
										Learn how to stream your desktop/game audio
									</translate>
								</a>
							</p>

							<app-form-control-select
								:disabled="producer.isBusy"
								class="-mic-input"
								:class="{ '-hide-indicator': !hasDesktopAudio }"
							>
								<option
									:value="PRODUCER_UNSET_DEVICE"
									:disabled="
										wouldInvalidateIfRemoved('selectedDesktopAudioDeviceId')
									"
								>
									<translate>Not Set</translate>
								</option>

								<option
									v-for="mic of mics"
									:key="mic.deviceId"
									:value="mic.deviceId"
									:disabled="
										mic.groupId === selectedMicGroupId
											? !canSwapAudioInputs
											: false
									"
								>
									{{
										mic.groupId === selectedMicGroupId
											? `[${$gettext('Microphone')}] `
											: ''
									}}
									{{ mic.label }}
								</option>
							</app-form-control-select>

							<app-volume-meter
								v-if="hasDesktopAudio"
								class="-volume-meter"
								:producer="producer"
								type="desktop-audio"
							/>

							<app-expand :when="hasDesktopAudio">
								<p class="help-block">
									<translate>
										The volume meter should only move when you hear audio from
										your game/desktop. If it's moving when you hear the other
										people in the stream, it is set up incorrectly and people
										will hear an echo when viewing your stream.
									</translate>
								</p>
							</app-expand>

							<app-expand :when="isInvalidMicConfig">
								<div class="alert alert-notice sans-margin-bottom">
									<translate>
										You need to choose two different microphones for your voice
										and desktop audio.
									</translate>
								</div>
							</app-expand>
						</app-form-group>
					</div>
				</app-expand>
			</fieldset>

			<div v-if="!isStreaming" class="-actions">
				<app-button trans @click="onClickCancel()">
					<translate>Cancel</translate>
				</app-button>

				<app-button
					primary
					solid
					:disabled="producer.isBusy || isInvalidConfig"
					@click="onClickStartStreaming()"
				>
					<translate>Start</translate>
				</app-button>
			</div>
		</app-form>
	</app-loading-fade>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-video-preview
	height: 300px
	margin: auto

	>>> > div
		// Unset agora background color nobody asked for
		background-color: transparent !important

	&.-hidden
		display: none

.-mic-input
	&:not(.-hide-indicator)
		border-bottom-left-radius: 0
		border-bottom-right-radius: 0
		border-bottom: 0

.-volume-meter
	theme-prop('border-color', 'bg-subtle')
	border-width: $border-width-base
	border-style: solid
	border-top: 0
	border-bottom-left-radius: $input-border-radius
	border-bottom-right-radius: $input-border-radius

.-disabled
	cursor: not-allowed

.-actions
	width: 100%
	display: inline-flex
	justify-content: flex-end
	padding-top: $line-height-computed
	grid-gap: 8px

.-desktop-well
	margin-bottom: 0

.-intro
	rounded-corners()
	change-bg('bi-bg')
	elevate-1()
	pressy()
	display: block
	padding: 8px
	color: var(--theme-bi-fg)
	margin-bottom: $line-height-computed
	cursor: pointer
	user-select: none

	&:hover
		elevate-hover-2()

	&-subtitle
		font-size: $font-size-small

	&-title
		font-size: $font-size-large
</style>
