import { nextTick } from 'vue';
import { Emit, mixins, Options, Prop, Watch } from 'vue-property-decorator';
import { debounce, sleep } from '../../../../../utils/utils';
import { MediaDeviceService } from '../../../../../_common/agora/media-device.service';
import AppExpand from '../../../../../_common/expand/expand.vue';
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
		return this.c.rtc!;
	}

	// This could potentially get cleared out if the user loses their hosting
	// permissions in the middle of streaming.
	get producer() {
		return this.c.rtc!.producer!;
	}

	onInit() {
		this._producer = this.producer;
		this.c.isShowingStreamSetup = true;

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

		this.c.isShowingStreamSetup = false;
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
