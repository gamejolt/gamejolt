import { Component, Emit, Prop, Watch } from 'vue-property-decorator';
import { debounce, sleep } from '../../../../utils/utils';
import { propRequired } from '../../../../utils/vue';
import { MediaDeviceService } from '../../../../_common/agora/media-device.service';
import AppExpand from '../../../../_common/expand/expand.vue';
import {
	assignPreferredProducerDevices,
	clearSelectedRecordingDevices,
	FiresideRTCProducer,
	getOwnDesktopAudioVolume,
	getOwnMicAudioVolume,
	PRODUCER_DEFAULT_GROUP_AUDIO,
	PRODUCER_UNSET_DEVICE,
	setSelectedDesktopAudioDeviceId,
	setSelectedGroupAudioDeviceId,
	setSelectedMicDeviceId,
	setSelectedWebcamDeviceId,
	setVideoPreviewElement,
	startStreaming,
	stopStreaming,
} from '../../../../_common/fireside/rtc/producer';
import AppFormControlToggle from '../../../../_common/form-vue/control/toggle/toggle.vue';
import { BaseForm, FormOnInit } from '../../../../_common/form-vue/form.service';
import AppForm from '../../../../_common/form-vue/form.vue';
import AppFormLegend from '../../../../_common/form-vue/legend/legend.vue';
import AppLoadingFade from '../../../../_common/loading/fade/fade.vue';
import AppVolumeMeter from './volume-meter.vue';

const Beeps = [
	new Audio(require('./beep1.ogg')),
	new Audio(require('./beep2.ogg')),
	new Audio(require('./beep3.ogg')),
	new Audio(require('./beep4.ogg')),
	new Audio(require('./beep5.ogg')),
];

type FormModel = {
	selectedWebcamDeviceId: string;
	selectedMicDeviceId: string;
	selectedDesktopAudioDeviceId: string;
	selectedGroupAudioDeviceId: string;
	tempSelectedMicDeviceId: string | null;
	tempSelectedDesktopAudioDeviceId: string | null;
	tempSelectedGroupAudioDeviceId: string;
};

@Component({
	components: {
		AppExpand,
		AppVolumeMeter,
		AppFormControlToggle,
		AppFormLegend,
		AppLoadingFade,
	},
})
export default class AppStreamSetup extends BaseForm<FormModel> implements FormOnInit {
	@Prop(propRequired(FiresideRTCProducer)) firesideHostRtc!: FiresideRTCProducer;

	isStarting = false;
	desktopAudioVolume = 0;
	micAudioVolume = 0;
	private p_refreshVolumeInterval: NodeJS.Timer | null = null;
	private p_shouldShowAdvanced = false;
	private _didDetectDevices = false;

	private networkQualityDebounce: () => void = null as any;

	readonly PRODUCER_UNSET_DEVICE = PRODUCER_UNSET_DEVICE;

	@Emit('close') emitClose() {}

	$refs!: {
		form: AppForm;
		videoPreview?: HTMLDivElement;
	};

	onInit() {
		const webcamId = this.getDeviceFromId(
			this.firesideHostRtc.selectedWebcamDeviceId,
			'webcam'
		)?.deviceId;
		const micId = this.getDeviceFromId(
			this.firesideHostRtc.selectedMicDeviceId,
			'mic'
		)?.deviceId;
		const desktopId = this.getDeviceFromId(
			this.firesideHostRtc.selectedDesktopAudioDeviceId,
			'mic'
		)?.deviceId;
		const groupId = this.getDeviceFromId(
			this.firesideHostRtc.selectedGroupAudioDeviceId,
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
		MediaDeviceService.detectDevices({ prompt: true, skipIfPrompted: false }).finally(() => {
			assignPreferredProducerDevices(this.firesideHostRtc);
			this._didDetectDevices = true;
			// Reinitialize so that the form fields match with our producer.
			this.onInit();
		});

		this.p_refreshVolumeInterval = setInterval(() => {
			this.desktopAudioVolume = getOwnDesktopAudioVolume(this.firesideHostRtc);
			this.micAudioVolume = getOwnMicAudioVolume(this.firesideHostRtc);
		}, 100);
	}

	destroyed() {
		if (this.p_refreshVolumeInterval) {
			clearInterval(this.p_refreshVolumeInterval);
		}

		// If we're not streaming or about to, clear the selected device ids so
		// that the browser doesn't think we're still recording.
		if (!(this.isStreaming || this.isStarting)) {
			clearSelectedRecordingDevices(this.firesideHostRtc);
		}
	}

	get isStreaming() {
		return this.firesideHostRtc.isStreaming;
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

	@Watch('canStreamVideo', { immediate: true })
	async onCanStreamVideoChanged() {
		// Wait to let the video element get mounted
		await this.$nextTick();

		console.log('setting video preview element', this.$refs.videoPreview);
		setVideoPreviewElement(
			this.firesideHostRtc,
			this.canStreamVideo ? this.$refs.videoPreview ?? null : null
		);
	}

	get canStreamVideo() {
		return this.firesideHostRtc.canStreamVideo;
	}

	get canStreamAudio() {
		return this.firesideHostRtc.canStreamAudio;
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

	wouldInvalidateIfRemoved(fieldToRemove: string) {
		if (!this.isStreaming) {
			return false;
		}

		const required = Object.assign({}, this.requiredFields);
		delete required[fieldToRemove];
		return Object.entries(required).every(([_key, value]) => value === PRODUCER_UNSET_DEVICE);
	}

	onToggleAdvanced() {
		this.p_shouldShowAdvanced = !this.p_shouldShowAdvanced;
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
			await startStreaming(this.firesideHostRtc);
		} catch {}

		this.isStarting = false;

		// Only close the modal if we were able to start streaming.
		if (this.firesideHostRtc.isStreaming) {
			this.emitClose();
		}
	}

	get shouldShowAdvanced() {
		return this.p_shouldShowAdvanced;
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

	get canMakeNoise() {
		return this.formModel.selectedGroupAudioDeviceId !== PRODUCER_DEFAULT_GROUP_AUDIO;
	}

	makeSomeNoise() {
		if (!this.canMakeNoise) {
			return;
		}

		const beep = Beeps[Math.floor(Math.random() * Beeps.length)];
		(beep as any).setSinkId(this.formModel.selectedGroupAudioDeviceId);
		beep.play();
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
			stopStreaming(this.firesideHostRtc);
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

		const rtc = this.firesideHostRtc;

		setSelectedWebcamDeviceId(rtc, this.formModel.selectedWebcamDeviceId);
		setSelectedMicDeviceId(rtc, this.formModel.selectedMicDeviceId);
		setSelectedDesktopAudioDeviceId(rtc, this.formModel.selectedDesktopAudioDeviceId);
		setSelectedGroupAudioDeviceId(rtc, this.formModel.selectedGroupAudioDeviceId);
	}

	@Watch('firesideHostRtc.isPoorNetworkQuality')
	onNetworkQualityChanged() {
		this.networkQualityDebounce ??= debounce(() => {
			if (this.firesideHostRtc.isPoorNetworkQuality) {
				console.log('Network quality is poor.');
			} else {
				console.log('Network quality is very nice.');
			}
		}, 3_000);

		this.networkQualityDebounce();
	}
}
