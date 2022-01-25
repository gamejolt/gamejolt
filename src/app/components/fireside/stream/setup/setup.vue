<script lang="ts">
import { nextTick } from 'vue';
import { Emit, mixins, Options, Prop, Watch } from 'vue-property-decorator';
import { debounce, sleep } from '../../../../../utils/utils';
import { MediaDeviceService } from '../../../../../_common/agora/media-device.service';
import AppExpand from '../../../../../_common/expand/AppExpand.vue';
import {
	assignPreferredProducerDevices,
	clearSelectedRecordingDevices,
	FiresideRTCProducer,
	PRODUCER_DEFAULT_GROUP_AUDIO,
	PRODUCER_UNSET_DEVICE,
	setSelectedDesktopAudioDeviceId,
	setSelectedGroupAudioDeviceId,
	setSelectedMicDeviceId,
	setSelectedWebcamDeviceId,
	setVideoPreviewElement,
	startStreaming,
	stopStreaming,
} from '../../../../../_common/fireside/rtc/producer';
import AppFormLegend from '../../../../../_common/form-vue/AppFormLegend.vue';
import AppFormControlToggle from '../../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import { BaseForm } from '../../../../../_common/form-vue/form.service';
import AppLoadingFade from '../../../../../_common/loading/AppLoadingFade.vue';
import { Navigate } from '../../../../../_common/navigate/navigate.service';
import { FiresideController } from '../../controller/controller';
import { StreamSetupModal } from './setup-modal.service';
import AppVolumeMeter from './volume-meter.vue';

type FormModel = {
	selectedWebcamDeviceId: string;
	selectedMicDeviceId: string;
	selectedDesktopAudioDeviceId: string;
	selectedGroupAudioDeviceId: string;
	tempSelectedMicDeviceId: string | null;
	tempSelectedDesktopAudioDeviceId: string | null;
	tempSelectedGroupAudioDeviceId: string;
};

class Wrapper extends BaseForm<FormModel> {}

@Options({
	components: {
		AppExpand,
		AppVolumeMeter,
		AppFormControlToggle,
		AppFormLegend,
		AppLoadingFade,
	},
})
export default class AppStreamSetup extends mixins(Wrapper) {
	@Prop({ type: Object, required: true })
	c!: FiresideController;

	isStarting = false;
	shouldShowAdvanced = false;
	private _didDetectDevices = false;
	private _producer!: FiresideRTCProducer;

	private networkQualityDebounce: () => void = null as any;

	readonly PRODUCER_UNSET_DEVICE = PRODUCER_UNSET_DEVICE;

	@Emit('close') emitClose() {}

	declare $refs: {
		videoPreview?: HTMLDivElement;
	};

	get rtc() {
		return this.c.rtc.value!;
	}

	// This could potentially get cleared out if the user loses their hosting
	// permissions in the middle of streaming.
	get producer() {
		return this.c.rtc.value!.producer!;
	}

	onInit() {
		this._producer = this.producer;
		this.c.isShowingStreamSetup.value = true;

		const webcamId = this.getDeviceFromId(
			this.producer.selectedWebcamDeviceId,
			'webcam'
		)?.deviceId;
		const micId = this.getDeviceFromId(this.producer.selectedMicDeviceId, 'mic')?.deviceId;
		const desktopId = this.getDeviceFromId(
			this.producer.selectedDesktopAudioDeviceId,
			'mic'
		)?.deviceId;
		const groupId = this.getDeviceFromId(
			this.producer.selectedGroupAudioDeviceId,
			'speaker'
		)?.deviceId;

		this.setField('selectedWebcamDeviceId', webcamId ?? PRODUCER_UNSET_DEVICE);
		this.setField('tempSelectedMicDeviceId', micId ?? PRODUCER_UNSET_DEVICE);
		this.setField('tempSelectedDesktopAudioDeviceId', desktopId ?? PRODUCER_UNSET_DEVICE);
		this.setField('tempSelectedGroupAudioDeviceId', groupId ?? PRODUCER_DEFAULT_GROUP_AUDIO);
	}

	mounted() {
		// If we don't prompt here, the user can end up denying permissions and
		// then opening this form again to an empty device list.
		this._detectDevices();
	}

	private async _detectDevices() {
		try {
			await MediaDeviceService.detectDevices({ prompt: true, skipIfPrompted: false });
		} finally {
			assignPreferredProducerDevices(this.producer);
			this._didDetectDevices = true;
			// Reinitialize so that the form fields match with our producer.
			this.onInit();
		}
	}

	unmounted() {
		// If we're not streaming or about to, clear the selected device ids so
		// that the browser doesn't think we're still recording.
		if (!(this.isStreaming || this.isStarting)) {
			clearSelectedRecordingDevices(this._producer);
		}

		this.c.isShowingStreamSetup.value = false;
	}

	get isStreaming() {
		return this.producer?.isStreaming === true;
	}

	get hasMicAudio() {
		return (
			(this.formModel.selectedMicDeviceId ?? PRODUCER_UNSET_DEVICE) !== PRODUCER_UNSET_DEVICE
		);
	}

	get hasDesktopAudio() {
		return (
			(this.formModel.selectedDesktopAudioDeviceId ?? PRODUCER_UNSET_DEVICE) !==
			PRODUCER_UNSET_DEVICE
		);
	}

	get hasWebcam() {
		return (
			(this.formModel.selectedWebcamDeviceId ?? PRODUCER_UNSET_DEVICE) !==
			PRODUCER_UNSET_DEVICE
		);
	}

	get selectedMicGroupId() {
		return this.getDeviceFromId(this.formModel.selectedMicDeviceId, 'mic')?.groupId;
	}

	get selectedDesktopAudioGroupId() {
		return this.getDeviceFromId(this.formModel.selectedDesktopAudioDeviceId, 'mic')?.groupId;
	}

	@Watch('producer')
	onProducerChanged() {
		// The only way this should trigger is if we get removed as a cohost
		// while we're creating/modifying a stream setup.
		if (!this.producer) {
			StreamSetupModal.close();
		}
	}

	@Watch('canStreamVideo', { immediate: true })
	async onCanStreamVideoChanged() {
		// Wait to let the video element get mounted
		await nextTick();

		setVideoPreviewElement(
			this.producer,
			this.canStreamVideo ? this.$refs.videoPreview ?? null : null
		);
	}

	get canStreamVideo() {
		return this.producer.canStreamVideo;
	}

	get canStreamAudio() {
		return this.producer.canStreamAudio;
	}

	get hasWebcamPermissions() {
		return MediaDeviceService.hasWebcamPermissions;
	}

	get webcamPermissionsWerePrompted() {
		return MediaDeviceService.webcamPermissionsWerePrompted;
	}

	get webcams() {
		return MediaDeviceService.webcams;
	}

	onClickPromptWebcamPermissions() {
		MediaDeviceService.detectWebcams({ prompt: true, skipIfPrompted: false });
	}

	get hasMicPermissions() {
		return MediaDeviceService.hasMicPermissions;
	}

	get micPermissionsWerePrompted() {
		return MediaDeviceService.micPermissionsWerePrompted;
	}

	get mics() {
		return MediaDeviceService.mics;
	}

	onClickPromptMicPermissions() {
		MediaDeviceService.detectMics({ prompt: true, skipIfPrompted: false });
	}

	get isInvalidMicConfig() {
		return (
			this.formModel.selectedMicDeviceId !== PRODUCER_UNSET_DEVICE &&
			this.formModel.selectedDesktopAudioDeviceId !== PRODUCER_UNSET_DEVICE &&
			this.formModel.selectedMicDeviceId === this.formModel.selectedDesktopAudioDeviceId
		);
	}

	get canToggleAdvanced() {
		if (!this.isStreaming) {
			return true;
		}

		return Object.entries(this.requiredFields).some(
			([_key, value]) => value !== PRODUCER_UNSET_DEVICE
		);
	}

	// We required at least one of these fields to be filled out.
	get requiredFields(): Record<string, string> {
		return {
			selectedWebcamDeviceId: this.formModel.selectedWebcamDeviceId,
			selectedMicDeviceId: this.formModel.selectedMicDeviceId,
		};
	}

	get audioInputFields(): Record<string, string> {
		return {
			selectedMicDeviceId: this.formModel.selectedMicDeviceId,
			selectedDesktopAudioDeviceId: this.formModel.selectedDesktopAudioDeviceId,
		};
	}

	get canSwapAudioInputs() {
		if (!this.isStreaming) {
			return true;
		}

		// If we could potentially swap away from our only valid required
		// device, we need to check if we'll either get a new one or have a
		// different device active that meets the form requirements.
		if (this.formModel.selectedMicDeviceId !== PRODUCER_UNSET_DEVICE) {
			const required = Object.assign({}, this.requiredFields, this.audioInputFields);
			delete required['selectedMicDeviceId'];
			return Object.entries(required).some(
				([_key, value]) => value !== PRODUCER_UNSET_DEVICE
			);
		}

		return Object.entries(this.audioInputFields).some(
			([_key, value]) => value !== PRODUCER_UNSET_DEVICE
		);
	}

	openHelpLink(event: Event) {
		if (event.currentTarget instanceof HTMLAnchorElement) {
			Navigate.newWindow(event.currentTarget.href!);
			event.stopPropagation();
			event.preventDefault();
		}
	}

	wouldInvalidateIfRemoved(fieldToRemove: string) {
		if (!this.isStreaming) {
			return false;
		}

		const required = Object.assign({}, this.requiredFields);
		delete required[fieldToRemove];
		return Object.entries(required).every(([_key, value]) => value === PRODUCER_UNSET_DEVICE);
	}

	onToggleAdvanced() {
		this.shouldShowAdvanced = !this.shouldShowAdvanced;
	}

	onClickCancel() {
		this.emitClose();
	}

	async onClickStartStreaming() {
		if (this.isStarting) {
			return;
		}
		this.isStarting = true;

		try {
			await startStreaming(this.producer);
		} catch {}

		this.isStarting = false;

		// Only close the modal if we were able to start streaming.
		if (this.producer.isStreaming) {
			this.emitClose();
		}
	}

	get hasSpeakerPermissions() {
		return MediaDeviceService.hasSpeakerPermissions;
	}

	get speakerPermissionsWerePrompted() {
		return MediaDeviceService.speakerPermissionsWerePrompted;
	}

	get speakers() {
		return MediaDeviceService.speakers;
	}

	onClickPromptSpeakerPermissions() {
		MediaDeviceService.detectSpeakers({ prompt: true, skipIfPrompted: false });
	}

	/**
	 * This will be `false` if we detected anything wrong with the config.
	 */
	get isInvalidConfig() {
		if (this.isInvalidMicConfig) {
			return true;
		}

		// Need to stream something
		return (
			!this.getDeviceFromId(this.formModel.selectedWebcamDeviceId, 'webcam') &&
			!this.getDeviceFromId(this.formModel.selectedMicDeviceId, 'mic')
		);
	}

	private getDeviceFromId(id: string | null, deviceType: 'mic' | 'webcam' | 'speaker') {
		if (id === null) {
			return;
		}

		switch (deviceType) {
			case 'mic':
				return this.mics.find(i => i.deviceId == id);
			case 'speaker':
				return this.speakers.find(i => i.deviceId == id);
			case 'webcam':
				return this.webcams.find(i => i.deviceId == id);
		}
	}

	@Watch('isInvalidConfig')
	async onInvalidConfigChanged() {
		// The form will become invalid from the mic and desktop audio tracks
		// having the same ID, so we need to see if it's still invalid after
		// giving it a chance to resolve itself.
		await sleep(0);

		if (this.isInvalidConfig && this.isStreaming) {
			stopStreaming(this.producer);
		}
	}

	@Watch('formModel.tempSelectedMicDeviceId')
	onTempSelectedMicChanged() {
		const oldMic = this.getDeviceFromId(this.formModel.selectedMicDeviceId, 'mic');
		const oldDesktop = this.getDeviceFromId(this.formModel.selectedDesktopAudioDeviceId, 'mic');
		const newMic = this.getDeviceFromId(this.formModel.tempSelectedMicDeviceId, 'mic');
		const newId = newMic?.deviceId ?? PRODUCER_UNSET_DEVICE;

		this.setField('selectedMicDeviceId', newMic?.deviceId ?? PRODUCER_UNSET_DEVICE);
		if (newId !== PRODUCER_UNSET_DEVICE && newMic?.groupId == oldDesktop?.groupId) {
			this.setField(
				'tempSelectedDesktopAudioDeviceId',
				oldMic?.deviceId ?? PRODUCER_UNSET_DEVICE
			);
		}
	}

	@Watch('formModel.tempSelectedDesktopAudioDeviceId')
	onTempSelectedDesktopAudioChanged() {
		const oldMic = this.getDeviceFromId(this.formModel.selectedMicDeviceId, 'mic');
		const oldDesktop = this.getDeviceFromId(this.formModel.selectedDesktopAudioDeviceId, 'mic');
		const newDesktop = this.getDeviceFromId(
			this.formModel.tempSelectedDesktopAudioDeviceId,
			'mic'
		);
		const newId = newDesktop?.deviceId ?? PRODUCER_UNSET_DEVICE;

		this.setField(
			'selectedDesktopAudioDeviceId',
			newDesktop?.deviceId ?? PRODUCER_UNSET_DEVICE
		);
		if (newId !== PRODUCER_UNSET_DEVICE && newDesktop?.groupId == oldMic?.groupId) {
			this.setField('tempSelectedMicDeviceId', oldDesktop?.deviceId ?? PRODUCER_UNSET_DEVICE);
		}
	}

	@Watch('formModel.tempSelectedGroupAudioDeviceId')
	onTempSelectedGroupAudioChanged() {
		this.setField(
			'selectedGroupAudioDeviceId',
			this.formModel.tempSelectedGroupAudioDeviceId ?? PRODUCER_DEFAULT_GROUP_AUDIO
		);
	}

	@Watch('formModel.selectedWebcamDeviceId')
	@Watch('formModel.selectedMicDeviceId')
	@Watch('formModel.selectedDesktopAudioDeviceId')
	@Watch('formModel.selectedGroupAudioDeviceId')
	onSelectedDevicesChanged() {
		// When streaming, only apply changes to selected devices if the config is valid.
		if ((this.isInvalidConfig && this.isStreaming) || !this._didDetectDevices) {
			// TODO: show error status on the form model values that do not match with whats set on firesideHostRtc.
			return;
		}

		setSelectedWebcamDeviceId(this.producer, this.formModel.selectedWebcamDeviceId);
		setSelectedMicDeviceId(this.producer, this.formModel.selectedMicDeviceId);
		setSelectedDesktopAudioDeviceId(this.producer, this.formModel.selectedDesktopAudioDeviceId);
		setSelectedGroupAudioDeviceId(this.producer, this.formModel.selectedGroupAudioDeviceId);
	}

	@Watch('rtc.isPoorNetworkQuality')
	onNetworkQualityChanged() {
		this.networkQualityDebounce ??= debounce(() => {
			if (this.rtc.isPoorNetworkQuality) {
				console.log('Network quality is poor.');
			} else {
				console.log('Network quality is very nice.');
			}
		}, 3_000);

		this.networkQualityDebounce();
	}
}
</script>

<template>
	<app-loading-fade :is-loading="isStarting">
		<a class="-intro" href="https://gamejolt.com/p/qewgmbtc" @click="openHelpLink">
			<div class="-intro-subtitle">
				<translate>Voice chat and livestream on Game Jolt with your friends!</translate>
			</div>
			<div class="-intro-title">
				<translate>Read the setup guide to get started</translate>
			</div>
		</a>

		<app-form :controller="form">
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
								:disabled="
									wouldInvalidateIfRemoved('selectedMicDeviceId')
										? 'true'
										: undefined
								"
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
											? 'true'
											: undefined
										: undefined
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
								:disabled="
									wouldInvalidateIfRemoved('selectedWebcamDeviceId')
										? 'true'
										: undefined
								"
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

							<a href="https://gamejolt.com/p/qewgmbtc" @click="openHelpLink">
								<translate>Learn how to stream your gameplay or screen</translate>
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
					@click="onToggleAdvanced"
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

								<a href="https://gamejolt.com/p/qewgmbtc" @click="openHelpLink">
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
											? 'true'
											: undefined
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
												? 'true'
												: undefined
											: undefined
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
.-video-preview
	height: 300px
	margin: auto

	::v-deep(> div)
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
