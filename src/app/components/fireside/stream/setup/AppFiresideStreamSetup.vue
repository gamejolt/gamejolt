<script lang="ts" setup>
import { computed, onMounted, onUnmounted, PropType, ref, watch } from 'vue';
import { sleep } from '../../../../../utils/utils';
import { MediaDeviceService } from '../../../../../_common/agora/media-device.service';
import AppButton from '../../../../../_common/button/AppButton.vue';
import AppExpand from '../../../../../_common/expand/AppExpand.vue';
import {
	assignPreferredProducerDevices,
	clearSelectedRecordingDevices,
	FiresideRTCProducer,
	PRODUCER_DEFAULT_GROUP_AUDIO,
	PRODUCER_UNSET_DEVICE,
	setSelectedGroupAudioDeviceId,
	setSelectedMicDeviceId,
	setSelectedWebcamDeviceId,
	setShouldStreamDesktopAudio,
	setVideoPreviewElement,
	startStreaming,
	stopStreaming,
} from '../../../../../_common/fireside/rtc/producer';
import AppForm, { createForm, FormController } from '../../../../../_common/form-vue/AppForm.vue';
import AppFormGroup from '../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormLegend from '../../../../../_common/form-vue/AppFormLegend.vue';
import AppFormControlSelect from '../../../../../_common/form-vue/controls/AppFormControlSelect.vue';
import AppFormControlToggle from '../../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import AppLoadingFade from '../../../../../_common/loading/AppLoadingFade.vue';
import { Navigate } from '../../../../../_common/navigate/navigate.service';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import { FiresideController } from '../../controller/controller';
import AppFiresideStreamSetupVolumeMeter from './AppFiresideStreamSetupVolumeMeter.vue';
import { StreamSetupModal } from './setup-modal.service';

type FormModel = {
	selectedWebcamDeviceId: string;
	selectedMicDeviceId: string;
	selectedDesktopAudioDeviceId: string;
	selectedGroupAudioDeviceId: string;

	streamDesktopAudio: boolean;

	tempSelectedMicDeviceId: string | null;
	tempSelectedDesktopAudioDeviceId: string | null;
	tempSelectedGroupAudioDeviceId: string;
};

const props = defineProps({
	c: {
		type: Object as PropType<FiresideController>,
		required: true,
	},
});

const emit = defineEmits({
	close: () => true,
});

// eslint-disable-next-line vue/no-setup-props-destructure
const { rtc, isShowingStreamSetup } = props.c;
const {
	hasWebcamPermissions,
	webcamsWasPrompted,
	webcams,
	hasMicPermissions,
	micsWasPrompted,
	mics,
	hasSpeakerPermissions,
	speakersWasPrompted,
	speakers,
} = MediaDeviceService;

// This could potentially get cleared out if the user loses their hosting
// permissions in the middle of streaming.
const producer = computed(() => rtc.value!.producer!);

const isStarting = ref(false);
const shouldShowAdvanced = ref(false);
let _didDetectDevices = false;
let _producer: FiresideRTCProducer;

const videoPreviewElem = ref<HTMLDivElement>();

const isPersonallyStreaming = computed(() => producer.value?.isStreaming === true);

const hasMicAudio = computed(
	() => (form.formModel.selectedMicDeviceId ?? PRODUCER_UNSET_DEVICE) !== PRODUCER_UNSET_DEVICE
);

const hasDesktopAudio = computed(
	() =>
		(form.formModel.selectedDesktopAudioDeviceId ?? PRODUCER_UNSET_DEVICE) !==
		PRODUCER_UNSET_DEVICE
);

const hasWebcam = computed(
	() => (form.formModel.selectedWebcamDeviceId ?? PRODUCER_UNSET_DEVICE) !== PRODUCER_UNSET_DEVICE
);

const selectedMicGroupId = computed(
	() => _getDeviceFromId(form.formModel.selectedMicDeviceId, 'mic')?.groupId
);

const selectedDesktopAudioGroupId = computed(
	() => _getDeviceFromId(form.formModel.selectedDesktopAudioDeviceId, 'mic')?.groupId
);

const canStreamVideo = computed(() => producer.value.canStreamVideo);
const canStreamAudio = computed(() => producer.value.canStreamAudio);

const isInvalidMicConfig = computed(() => {
	return (
		form.formModel.selectedMicDeviceId !== PRODUCER_UNSET_DEVICE &&
		form.formModel.selectedDesktopAudioDeviceId !== PRODUCER_UNSET_DEVICE &&
		form.formModel.selectedMicDeviceId === form.formModel.selectedDesktopAudioDeviceId
	);
});

// We require at least one of these fields to be filled out.
const requiredFields = computed((): Record<string, string> => {
	return {
		selectedWebcamDeviceId: form.formModel.selectedWebcamDeviceId,
		selectedMicDeviceId: form.formModel.selectedMicDeviceId,
	};
});

const audioInputFields = computed((): Record<string, string> => {
	return {
		selectedMicDeviceId: form.formModel.selectedMicDeviceId,
		selectedDesktopAudioDeviceId: form.formModel.selectedDesktopAudioDeviceId,
	};
});

const canSwapAudioInputs = computed(() => {
	if (!isPersonallyStreaming.value) {
		return true;
	}

	// If we could potentially swap away from our only valid required
	// device, we need to check if we'll either get a new one or have a
	// different device active that meets the form requirements.
	if (form.formModel.selectedMicDeviceId !== PRODUCER_UNSET_DEVICE) {
		const required = Object.assign({}, requiredFields.value, audioInputFields.value);
		delete required['selectedMicDeviceId'];
		return Object.entries(required).some(([_key, value]) => value !== PRODUCER_UNSET_DEVICE);
	}

	return Object.entries(audioInputFields.value).some(
		([_key, value]) => value !== PRODUCER_UNSET_DEVICE
	);
});

/**
 * This will be `false` if we detected anything wrong with the config.
 */
const isInvalidConfig = computed(() => {
	if (isInvalidMicConfig.value) {
		return true;
	}

	// Need to stream something
	return (
		!_getDeviceFromId(form.formModel.selectedWebcamDeviceId, 'webcam') &&
		!_getDeviceFromId(form.formModel.selectedMicDeviceId, 'mic')
	);
});

const form: FormController<FormModel> = createForm({
	onInit() {
		_initForm();
	},
});

onMounted(() => {
	// If we don't prompt here, the user can end up denying permissions and
	// then opening this form again to an empty device list.
	_detectDevices();
});

onUnmounted(() => {
	// If we're not streaming or about to, clear the selected device ids so
	// that the browser doesn't think we're still recording.
	if (!(isPersonallyStreaming.value || isStarting.value)) {
		clearSelectedRecordingDevices(_producer);
	}

	isShowingStreamSetup.value = false;
});

watch(
	[canStreamVideo, videoPreviewElem],
	([canStreamVideo, videoPreviewElem]) => {
		if (!videoPreviewElem) {
			return;
		}

		setVideoPreviewElement(producer.value, canStreamVideo ? videoPreviewElem ?? null : null);
	},
	{ immediate: true }
);

watch(producer, producer => {
	// The only way this should trigger is if we get removed as a cohost while
	// we're creating/modifying a stream setup.
	if (!producer) {
		StreamSetupModal.close();
	}
});

watch(isInvalidConfig, async () => {
	// The form will become invalid from the mic and desktop audio tracks
	// having the same ID, so we need to see if it's still invalid after
	// giving it a chance to resolve itself.
	await sleep(0);

	if (isInvalidConfig.value && isPersonallyStreaming.value) {
		stopStreaming(producer.value);
	}
});

watch(
	() => form.formModel.tempSelectedMicDeviceId,
	() => {
		const oldMic = _getDeviceFromId(form.formModel.selectedMicDeviceId, 'mic');
		const oldDesktop = _getDeviceFromId(form.formModel.selectedDesktopAudioDeviceId, 'mic');
		const newMic = _getDeviceFromId(form.formModel.tempSelectedMicDeviceId, 'mic');
		const newId = newMic?.deviceId ?? PRODUCER_UNSET_DEVICE;

		form.formModel.selectedMicDeviceId = newMic?.deviceId ?? PRODUCER_UNSET_DEVICE;
		if (newId !== PRODUCER_UNSET_DEVICE && newMic?.groupId == oldDesktop?.groupId) {
			form.formModel.tempSelectedDesktopAudioDeviceId =
				oldMic?.deviceId ?? PRODUCER_UNSET_DEVICE;
		}
	}
);

watch(
	() => form.formModel.tempSelectedDesktopAudioDeviceId,
	() => {
		const oldMic = _getDeviceFromId(form.formModel.selectedMicDeviceId, 'mic');
		const oldDesktop = _getDeviceFromId(form.formModel.selectedDesktopAudioDeviceId, 'mic');
		const newDesktop = _getDeviceFromId(form.formModel.tempSelectedDesktopAudioDeviceId, 'mic');
		const newId = newDesktop?.deviceId ?? PRODUCER_UNSET_DEVICE;

		form.formModel.selectedDesktopAudioDeviceId = newDesktop?.deviceId ?? PRODUCER_UNSET_DEVICE;
		if (newId !== PRODUCER_UNSET_DEVICE && newDesktop?.groupId == oldMic?.groupId) {
			form.formModel.tempSelectedMicDeviceId = oldDesktop?.deviceId ?? PRODUCER_UNSET_DEVICE;
		}
	}
);

watch(
	() => form.formModel.tempSelectedGroupAudioDeviceId,
	() => {
		form.formModel.selectedGroupAudioDeviceId =
			form.formModel.tempSelectedGroupAudioDeviceId ?? PRODUCER_DEFAULT_GROUP_AUDIO;
	}
);

watch(
	[
		() => form.formModel.selectedWebcamDeviceId,
		() => form.formModel.selectedMicDeviceId,
		() => form.formModel.selectedDesktopAudioDeviceId,
		() => form.formModel.selectedGroupAudioDeviceId,
		() => form.formModel.streamDesktopAudio,
	],
	() => {
		// When streaming, only apply changes to selected devices if the config
		// is valid.
		if ((isInvalidConfig.value && isPersonallyStreaming.value) || !_didDetectDevices) {
			// TODO: show error status on the form model values that do not
			// match with whats set on firesideHostRtc.
			return;
		}

		setSelectedWebcamDeviceId(producer.value, form.formModel.selectedWebcamDeviceId);
		setSelectedMicDeviceId(producer.value, form.formModel.selectedMicDeviceId);
		setShouldStreamDesktopAudio(producer.value, form.formModel.streamDesktopAudio);
		// setSelectedDesktopAudioDeviceId(
		// 	producer.value,
		// 	form.formModel.selectedDesktopAudioDeviceId
		// );
		setSelectedGroupAudioDeviceId(producer.value, form.formModel.selectedGroupAudioDeviceId);
	}
);

function _initForm() {
	_producer = producer.value;
	isShowingStreamSetup.value = true;

	const webcamId = _getDeviceFromId(producer.value.selectedWebcamDeviceId, 'webcam')?.deviceId;
	const micId = _getDeviceFromId(producer.value.selectedMicDeviceId, 'mic')?.deviceId;
	const desktopId = _getDeviceFromId(
		producer.value.selectedDesktopAudioDeviceId,
		'mic'
	)?.deviceId;
	const groupId = _getDeviceFromId(
		producer.value.selectedGroupAudioDeviceId,
		'speaker'
	)?.deviceId;

	form.formModel.selectedWebcamDeviceId = webcamId ?? PRODUCER_UNSET_DEVICE;
	form.formModel.tempSelectedMicDeviceId = micId ?? PRODUCER_UNSET_DEVICE;
	form.formModel.tempSelectedDesktopAudioDeviceId = desktopId ?? PRODUCER_UNSET_DEVICE;
	form.formModel.tempSelectedGroupAudioDeviceId = groupId ?? PRODUCER_DEFAULT_GROUP_AUDIO;
	form.formModel.streamDesktopAudio = producer.value.shouldStreamDesktopAudio;
}

function onClickPromptWebcamPermissions() {
	MediaDeviceService.detectWebcams({ prompt: true, skipIfPrompted: false });
}

function onClickPromptMicPermissions() {
	MediaDeviceService.detectMics({ prompt: true, skipIfPrompted: false });
}

function onClickPromptSpeakerPermissions() {
	MediaDeviceService.detectSpeakers({ prompt: true, skipIfPrompted: false });
}

function openHelpLink(event: Event) {
	if (event.currentTarget instanceof HTMLAnchorElement) {
		Navigate.newWindow(event.currentTarget.href!);
		event.stopPropagation();
		event.preventDefault();
	}
}

function wouldInvalidateIfRemoved(fieldToRemove: string) {
	if (!isPersonallyStreaming.value) {
		return false;
	}

	return Object.entries(requiredFields.value)
		.filter(([key, _value]) => key !== fieldToRemove)
		.every(([_key, value]) => value === PRODUCER_UNSET_DEVICE);
}

function onToggleAdvanced() {
	shouldShowAdvanced.value = !shouldShowAdvanced.value;
}

function onClickCancel() {
	emit('close');
}

async function onClickStartStreaming() {
	if (isStarting.value) {
		return;
	}
	isStarting.value = true;

	try {
		await startStreaming(producer.value);
	} catch {}

	isStarting.value = false;

	// Only close the modal if we were able to start streaming.
	if (producer.value.isStreaming) {
		emit('close');
	}
}

function _getDeviceFromId(id: string | null, deviceType: 'mic' | 'webcam' | 'speaker') {
	if (id === null) {
		return;
	}

	switch (deviceType) {
		case 'mic':
			return mics.value.find(i => i.deviceId == id);
		case 'speaker':
			return speakers.value.find(i => i.deviceId == id);
		case 'webcam':
			return webcams.value.find(i => i.deviceId == id);
	}
}

async function _detectDevices() {
	try {
		await MediaDeviceService.detectDevices({ prompt: true, skipIfPrompted: false });
	} finally {
		assignPreferredProducerDevices(producer.value);
		_didDetectDevices = true;

		// Reinitialize so that the form fields match with our producer.
		_initForm();
	}
}
</script>

<template>
	<AppLoadingFade :is-loading="isStarting">
		<a class="-intro" href="https://gamejolt.com/p/qewgmbtc" @click="openHelpLink">
			<div class="-intro-subtitle">
				<AppTranslate>
					Voice chat and livestream on Game Jolt with your friends!
				</AppTranslate>
			</div>
			<div class="-intro-title">
				<AppTranslate>Read the setup guide to get started</AppTranslate>
			</div>
		</a>

		<AppForm :controller="form">
			<!-- <AppFormLegend compact>
					<AppTranslate>Voice Chat</AppTranslate>
				</AppFormLegend> -->

			<template v-if="canStreamAudio">
				<AppFormGroup name="tempSelectedMicDeviceId" :label="$gettext('Microphone')">
					<template v-if="!hasMicPermissions">
						<div class="alert" :class="{ 'alert-notice': micsWasPrompted }">
							<p>
								<AppTranslate>
									We need access to your inputs in order to stream your audio.
								</AppTranslate>
							</p>
							<AppButton v-if="!micsWasPrompted" @click="onClickPromptMicPermissions">
								<AppTranslate>Request Permission</AppTranslate>
							</AppButton>
							<p v-else>
								<strong>
									<AppTranslate>
										Click the lock icon next to the URL in your address bar to
										enable. You may need to open this window again or refresh
										the page to renew your devices.
									</AppTranslate>
								</strong>
							</p>
						</div>
					</template>
					<template v-else>
						<div class="alert">
							<p>
								<AppTranslate>
									Microphone is optional if you don't want people to hear you.
								</AppTranslate>
							</p>
						</div>

						<AppFormControlSelect
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
								<AppTranslate>Not Set</AppTranslate>
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
						</AppFormControlSelect>

						<AppFiresideStreamSetupVolumeMeter
							v-if="hasMicAudio"
							class="-volume-meter"
							:producer="producer"
							type="mic"
						/>

						<AppExpand :when="hasMicAudio">
							<p class="help-block">
								<AppTranslate>
									The volume meter should only move when you're speaking. If it's
									moving with the sounds your device is making, you've chosen the
									wrong input.
								</AppTranslate>
							</p>
						</AppExpand>
					</template>
				</AppFormGroup>

				<AppFormGroup
					name="tempSelectedGroupAudioDeviceId"
					:label="$gettext('Audio Output Device')"
				>
					<template v-if="!hasSpeakerPermissions">
						<div class="alert" :class="{ 'alert-notice': speakersWasPrompted }">
							<p>
								<AppTranslate>
									To hear the other people streaming with you, we'll need access
									to your output device so that we can pipe their beautiful voices
									into your earholes.
								</AppTranslate>
							</p>

							<AppButton
								v-if="!speakersWasPrompted"
								@click="onClickPromptSpeakerPermissions"
							>
								<AppTranslate>Request Permission</AppTranslate>
							</AppButton>
							<p v-else>
								<strong>
									<AppTranslate>
										Click the lock icon next to the URL in your address bar to
										enable. You may need to open this window again or refresh
										the page to renew your devices.
									</AppTranslate>
								</strong>
							</p>
						</div>
					</template>
					<template v-else>
						<AppFormControlSelect :disabled="producer.isBusy">
							<option
								v-for="speaker of speakers"
								:key="speaker.deviceId"
								:value="speaker.deviceId"
							>
								{{ speaker.label }}
							</option>
						</AppFormControlSelect>
					</template>
				</AppFormGroup>
			</template>

			<template v-if="canStreamVideo">
				<AppFormGroup name="selectedWebcamDeviceId" :label="$gettext('Video Source')">
					<template v-if="!hasWebcamPermissions">
						<div class="alert" :class="{ 'alert-notice': webcamsWasPrompted }">
							<p>
								<AppTranslate>
									To stream video we need access to your video source/camera.
								</AppTranslate>
							</p>
							<AppButton
								v-if="!webcamsWasPrompted"
								@click="onClickPromptWebcamPermissions"
							>
								<AppTranslate>Request Permission</AppTranslate>
							</AppButton>
							<p v-else>
								<strong>
									<AppTranslate>
										Click the lock icon next to the URL in your address bar to
										enable. You may need to open this window again or refresh
										the page to renew your devices.
									</AppTranslate>
								</strong>
							</p>
						</div>
					</template>
					<template v-else>
						<div class="alert">
							<p>
								<AppTranslate>
									Video source is optional if you just want to voice chat.
								</AppTranslate>
							</p>
						</div>

						<AppFormControlSelect :disabled="producer.isBusy">
							<option
								:value="PRODUCER_UNSET_DEVICE"
								:disabled="
									wouldInvalidateIfRemoved('selectedWebcamDeviceId')
										? 'true'
										: undefined
								"
							>
								<AppTranslate>Not set</AppTranslate>
							</option>

							<option
								v-for="webcam of webcams"
								:key="webcam.deviceId"
								:value="webcam.deviceId"
							>
								{{ webcam.label }}
							</option>
						</AppFormControlSelect>

						<p class="help-block">
							<AppTranslate>
								You can use the virtual camera in OBS or Streamlabs to capture your
								gameplay and make it available for streaming on Game Jolt.
							</AppTranslate>

							<br />

							<a href="https://gamejolt.com/p/qewgmbtc" @click="openHelpLink">
								<AppTranslate>
									Learn how to stream your gameplay or screen
								</AppTranslate>
							</a>
						</p>

						<div
							ref="videoPreviewElem"
							class="-video-preview"
							:class="{
								'-hidden': !hasWebcam,
							}"
						/>
					</template>
				</AppFormGroup>

				<template v-if="hasWebcam && canStreamAudio">
					<AppFormGroup
						name="streamDesktopAudio"
						:label="$gettext(`Stream desktop audio`)"
					>
						<template #inline-control>
							<AppFormControlToggle />
						</template>
					</AppFormGroup>
				</template>
			</template>

			<!-- Only show this section if they've given mic permissions -->
			<fieldset
				v-if="canStreamAudio && hasMicPermissions && form.formModel.streamDesktopAudio"
			>
				<AppFormLegend
					compact
					:expandable="!hasDesktopAudio"
					:expanded="shouldShowAdvanced"
					@click="onToggleAdvanced"
				>
					<AppTranslate>Advanced Settings</AppTranslate>
				</AppFormLegend>

				<AppExpand :when="shouldShowAdvanced || hasDesktopAudio" class="full-bleed">
					<div class="-desktop-well well sans-rounded fill-offset">
						<AppFormGroup
							name="tempSelectedDesktopAudioDeviceId"
							class="sans-margin-bottom"
							:label="$gettext('Desktop Audio')"
						>
							<p class="help-block">
								<AppTranslate>
									Streaming desktop audio requires the set up of a virtual audio
									cable in order to split the audio of your game/desktop from the
									audio of the other people in the stream.
								</AppTranslate>

								<br />

								<a href="https://gamejolt.com/p/qewgmbtc" @click="openHelpLink">
									<AppTranslate>
										Learn how to stream your desktop/game audio
									</AppTranslate>
								</a>
							</p>

							<AppFormControlSelect
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
									<AppTranslate>Not Set</AppTranslate>
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
							</AppFormControlSelect>

							<AppFiresideStreamSetupVolumeMeter
								v-if="hasDesktopAudio"
								class="-volume-meter"
								:producer="producer"
								type="desktop-audio"
							/>

							<AppExpand :when="hasDesktopAudio">
								<p class="help-block">
									<AppTranslate>
										The volume meter should only move when you hear audio from
										your game/desktop. If it's moving when you hear the other
										people in the stream, it is set up incorrectly and people
										will hear an echo when viewing your stream.
									</AppTranslate>
								</p>
							</AppExpand>

							<AppExpand :when="isInvalidMicConfig">
								<div class="alert alert-notice sans-margin-bottom">
									<AppTranslate>
										You need to choose two different microphones for your voice
										and desktop audio.
									</AppTranslate>
								</div>
							</AppExpand>
						</AppFormGroup>
					</div>
				</AppExpand>
			</fieldset>

			<div v-if="!isPersonallyStreaming" class="-actions">
				<AppButton trans @click="onClickCancel()">
					<AppTranslate>Cancel</AppTranslate>
				</AppButton>

				<AppButton
					primary
					solid
					:disabled="producer.isBusy || isInvalidConfig"
					@click="onClickStartStreaming()"
				>
					<AppTranslate>Start</AppTranslate>
				</AppButton>
			</div>
		</AppForm>
	</AppLoadingFade>
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
