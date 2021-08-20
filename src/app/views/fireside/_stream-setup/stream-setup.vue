<script lang="ts" src="./stream-setup"></script>

<template>
	<app-form ref="form" name="streamSetupForm">
		<app-form-group v-if="canStreamVideo" hide-label name="selectedWebcamDeviceId">
			<template v-if="!hasWebcamPermissions">
				<p><translate>To stream video we need access to the webcams.</translate></p>

				<app-button
					v-if="!webcamPermissionsWerePrompted"
					@click="onClickPromptWebcamPermissions"
				>
					<translate>Gib</translate>
				</app-button>
				<p v-else><translate>Click the lock icon next to the url to enable.</translate></p>
			</template>
			<app-form-control-select v-else :disabled="firesideHostRtc.isBusy">
				<option value=""><translate>Video (None)</translate></option>

				<option v-for="webcam of webcams" :key="webcam.deviceId" :value="webcam.deviceId">
					{{ webcam.label }}
				</option>
			</app-form-control-select>

			<p class="help-block">
				<span v-translate>
					Stream your <b>ＥＰＩＣ</b> gameplay using OBS or StreamLabs virtual camera.
				</span>

				<app-link-help page="fireside-streaming#virtual-camera" class="link-help">
					<translate>How?</translate>
				</app-link-help>
			</p>

			<div
				ref="videoPreview"
				class="-video-preview"
				:class="{ '-hidden': !firesideHostRtc.selectedWebcamDeviceId }"
			/>
		</app-form-group>

		<template v-if="canStreamAudio">
			<div v-if="!hasMicPermissions" class="form-group">
				<translate>We need access to your mic to:</translate>
				<ul>
					<li><translate>Stream your crispy / smooth voice.</translate></li>
					<li>
						<translate>Stream your game / desktop audio.</translate>
						<app-link-help page="fireside-streaming#desktop-audio" class="link-help">
							<translate>Why?</translate>
						</app-link-help>
					</li>
				</ul>

				<app-button v-if="!micPermissionsWerePrompted" @click="onClickPromptMicPermissions">
					<translate>Gib</translate>
				</app-button>
				<translate v-else>Click the lock icon next to the url to enable.</translate>
			</div>
			<template v-else>
				<app-form-group name="selectedMicDeviceId" hide-label>
					<app-form-control-select :disabled="firesideHostRtc.isBusy" class="-mic-input">
						<option value=""><translate>Microphone (None)</translate></option>

						<option v-for="mic of mics" :key="mic.deviceId" :value="mic.deviceId">
							{{ mic.label }}
						</option>
					</app-form-control-select>
					<app-volume-meter class="-volume-meter" :volume="micAudioVolume" />

					<p v-translate class="help-block">
						Volume meter should move only when <b>you</b> speak.
					</p>
				</app-form-group>

				<app-form-group name="selectedDesktopAudioDeviceId" hide-label>
					<app-form-control-select :disabled="firesideHostRtc.isBusy" class="-mic-input">
						<option value=""><translate>Desktop Audio (None)</translate></option>

						<option v-for="mic of mics" :key="mic.deviceId" :value="mic.deviceId">
							{{ mic.label }}
						</option>
					</app-form-control-select>
					<app-volume-meter class="-volume-meter" :volume="desktopAudioVolume" />

					<p class="help-block">
						<translate>Volume meter should move only when you hear stuff.</translate>
					</p>

					<app-expand :when="isInvalidMicConfig">
						<div class="alert alert-notice sans-margin-bottom">
							<translate>
								You need to choose two different microphones for your voice and
								desktop audio.
							</translate>
						</div>
					</app-expand>
				</app-form-group>
			</template>
		</template>

		<app-expand :when="shouldShowSelectSpeaker">
			<app-form-group name="selectedGroupAudioDeviceId" hide-label>
				<template v-if="!hasSpeakerPermissions">
					<translate>
						To hear your other streaming co-hosts we need access to your speakers.
					</translate>

					<app-button
						v-if="!speakerPermissionsWerePrompted"
						@click="onClickPromptSpeakerPermissions"
					>
						<translate>Gib</translate>
					</app-button>
					<translate v-else>Click the lock icon next to the url to enable.</translate>
				</template>
				<template v-else>
					<app-form-control-select :disabled="firesideHostRtc.isBusy">
						<option value=""><translate>Co-Host Audio (None)</translate></option>

						<option
							v-for="speaker of speakers"
							:key="speaker.deviceId"
							:value="speaker.deviceId"
						>
							{{ speaker.label }}
						</option>
					</app-form-control-select>

					<div class="-group-audio-info well fill-offset">
						<p>
							<app-jolticon icon="info-circle" />
							<span v-translate>
								Choose a speaker that is <b>not</b> captured by your desktop audio
								mic.
							</span>
						</p>

						<p>
							<translate>To test, click this button to make some noise:</translate>
							<app-button :disabled="!canMakeNoise" @click="makeSomeNoise()">
								<translate>Beep</translate>
							</app-button>
							<br />
							<translate>(The desktop audio volume meter should not move!)</translate>
						</p>
					</div>
				</template>
			</app-form-group>
		</app-expand>

		<app-form-group name="isStreaming" :label="$gettext('Streaming?')">
			<app-form-control-toggle :disabled="firesideHostRtc.isBusy || isInvalidConfig" />
		</app-form-group>
	</app-form>
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

.-group-audio-info
	border-top-left-radius: 0
	border-top-right-radius: 0
</style>
