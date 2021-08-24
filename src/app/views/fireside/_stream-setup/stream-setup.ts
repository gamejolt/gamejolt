import { Component, Prop, Watch } from 'vue-property-decorator';
import { debounce, sleep } from '../../../../utils/utils';
import { propRequired } from '../../../../utils/vue';
import { MediaDeviceService } from '../../../../_common/agora/media-device.service';
import AppExpand from '../../../../_common/expand/expand.vue';
import AppFormControlToggle from '../../../../_common/form-vue/control/toggle/toggle.vue';
import { BaseForm, FormOnInit } from '../../../../_common/form-vue/form.service';
import AppForm from '../../../../_common/form-vue/form.vue';
import { FiresideHostRtc } from '../fireside-host-rtc';
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
	tempSelectedGroupAudioDeviceId: string | null;
	isStreaming: boolean;
};

@Component({
	components: {
		AppExpand,
		AppVolumeMeter,
		AppFormControlToggle,
	},
})
export default class AppStreamSetup extends BaseForm<FormModel> implements FormOnInit {
	@Prop(propRequired(FiresideHostRtc)) firesideHostRtc!: FiresideHostRtc;

	desktopAudioVolume = 0;
	micAudioVolume = 0;
	private p_refreshVolumeInterval: NodeJS.Timer | null = null;
	private p_shouldShowAdvanced = false;
	private p_showAdvancedFormError = false;

	private networkQualityDebounce: () => void = null as any;

	$refs!: {
		form: AppForm;
		videoPreview?: HTMLDivElement;
	};

	onInit() {
		this.setField('selectedWebcamDeviceId', this.firesideHostRtc.selectedWebcamDeviceId);
		this.setField('tempSelectedMicDeviceId', this.firesideHostRtc.selectedMicDeviceId);
		this.setField(
			'tempSelectedDesktopAudioDeviceId',
			this.firesideHostRtc.selectedDesktopAudioDeviceId
		);
		this.setField(
			'selectedGroupAudioDeviceId',
			this.firesideHostRtc.selectedGroupAudioDeviceId
		);
		this.setField('isStreaming', this.firesideHostRtc.isStreaming);
	}

	mounted() {
		// If we don't prompt here, the user can end up denying permissions and
		// then opening this form again to an empty device list.
		MediaDeviceService.detectDevices({ prompt: true, skipIfPrompted: false });

		this.p_refreshVolumeInterval = setInterval(() => {
			this.desktopAudioVolume = this.firesideHostRtc.getDesktopAudioVolume();
			this.micAudioVolume = this.firesideHostRtc.getMicAudioVolume();
		}, 100);
	}

	destroyed() {
		if (this.p_refreshVolumeInterval) {
			clearInterval(this.p_refreshVolumeInterval);
		}
	}

	get hasMicAudio() {
		return this.formModel.selectedMicDeviceId !== '';
	}

	get hasDesktopAudio() {
		return this.formModel.selectedDesktopAudioDeviceId !== '';
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
		this.firesideHostRtc.setVideoPreviewElement(
			this.canStreamVideo ? this.$refs.videoPreview || null : null
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
			this.formModel.selectedMicDeviceId !== '' &&
			this.formModel.selectedDesktopAudioDeviceId !== '' &&
			this.formModel.selectedMicDeviceId === this.formModel.selectedDesktopAudioDeviceId
		);
	}

	get shouldShowAdvancedFormError() {
		return !this.canToggleAdvanced && this.p_showAdvancedFormError;
	}

	get canToggleAdvanced() {
		if (!this.formModel.isStreaming) {
			return true;
		}

		return [this.formModel.selectedMicDeviceId, this.formModel.selectedWebcamDeviceId].some(
			i => i !== ''
		);
	}

	wouldInvalidateIfRemoved(fieldToRemove: string) {
		if (!this.formModel.isStreaming) {
			return false;
		}

		const required: Record<string, string> = {
			selectedWebcamDeviceId: this.formModel.selectedWebcamDeviceId,
			selectedMicDeviceId: this.formModel.selectedMicDeviceId,
			selectedDesktopAudioDeviceId: this.formModel.selectedDesktopAudioDeviceId,
		};

		delete required[fieldToRemove];
		return Object.entries(required).every(([_key, value]) => value === '');
	}

	onToggleAdvanced() {
		if (this.shouldShowAdvanced && !this.canToggleAdvanced) {
			this.p_showAdvancedFormError = true;
			return;
		}

		this.p_shouldShowAdvanced = !this.p_shouldShowAdvanced;
		this.p_showAdvancedFormError = false;
	}

	get shouldShowAdvanced() {
		return this.p_shouldShowAdvanced;
	}

	get shouldShowSelectSpeaker() {
		return this.formModel.selectedDesktopAudioDeviceId !== '';
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
		return this.formModel.selectedGroupAudioDeviceId !== '';
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
			!this.mics.find(
				i =>
					i.deviceId == this.formModel.selectedMicDeviceId ||
					i.deviceId == this.formModel.selectedDesktopAudioDeviceId
			)
		);
	}

	private getDeviceFromId(id: string, deviceType: 'mic' | 'webcam' | 'speaker') {
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

		if (this.isInvalidConfig && this.formModel.isStreaming) {
			this.firesideHostRtc.stopStreaming();
		}
	}

	@Watch('shouldShowAdvanced')
	onShouldShowAdvancedChanged() {
		const newGroupAudio = this.shouldShowAdvanced
			? this.formModel.tempSelectedGroupAudioDeviceId ?? ''
			: '';
		this.setField('selectedGroupAudioDeviceId', newGroupAudio);

		if (
			this.shouldShowAdvanced &&
			// If we have the same ID stored as our currently active mic, change
			// the temp ID to empty and trigger the watcher for the value.
			this.formModel.tempSelectedDesktopAudioDeviceId === this.formModel.selectedMicDeviceId
		) {
			this.setField('tempSelectedDesktopAudioDeviceId', '');
		} else {
			const newDesktopAudio = this.shouldShowAdvanced
				? this.formModel.tempSelectedDesktopAudioDeviceId ?? ''
				: '';
			this.setField('selectedDesktopAudioDeviceId', newDesktopAudio);
		}
	}

	@Watch('formModel.tempSelectedMicDeviceId')
	onTempSelectedMicChanged() {
		const oldMic = this.getDeviceFromId(this.formModel.selectedMicDeviceId, 'mic');
		const oldDesktop = this.getDeviceFromId(this.formModel.selectedDesktopAudioDeviceId, 'mic');
		const newMic = this.getDeviceFromId(this.formModel.tempSelectedMicDeviceId ?? '', 'mic');
		const newId = newMic?.deviceId ?? '';

		this.setField('selectedMicDeviceId', newMic?.deviceId ?? '');
		if (newId !== '' && newMic?.groupId == oldDesktop?.groupId) {
			this.setField('tempSelectedDesktopAudioDeviceId', oldMic?.deviceId ?? '');
		}
	}

	@Watch('formModel.tempSelectedDesktopAudioDeviceId')
	onTempSelectedDesktopAudioChanged() {
		const oldMic = this.getDeviceFromId(this.formModel.selectedMicDeviceId, 'mic');
		const oldDesktop = this.getDeviceFromId(this.formModel.selectedDesktopAudioDeviceId, 'mic');
		const newDesktop = this.getDeviceFromId(
			this.formModel.tempSelectedDesktopAudioDeviceId ?? '',
			'mic'
		);
		const newId = newDesktop?.deviceId ?? '';

		this.setField('selectedDesktopAudioDeviceId', newDesktop?.deviceId ?? '');
		if (newId !== '' && newDesktop?.groupId == oldMic?.groupId) {
			this.setField('tempSelectedMicDeviceId', oldDesktop?.deviceId ?? '');
		}
	}

	@Watch('formModel.tempSelectedGroupAudioDeviceId')
	onTempSelectedGroupAudioChanged() {
		this.setField(
			'selectedGroupAudioDeviceId',
			this.formModel.tempSelectedDesktopAudioDeviceId ?? ''
		);
	}

	@Watch('formModel.selectedWebcamDeviceId')
	@Watch('formModel.selectedMicDeviceId')
	@Watch('formModel.selectedDesktopAudioDeviceId')
	@Watch('formModel.selectedGroupAudioDeviceId')
	onSelectedDevicesChanged() {
		// When streaming, only apply changes to selected devices if the config is valid.
		if (this.isInvalidConfig && this.firesideHostRtc.isStreaming) {
			// TODO: show error status on the form model values that do not match with whats set on firesideHostRtc.
			return;
		}

		console.log('applying changes to selected devices');
		this.firesideHostRtc.selectedWebcamDeviceId = this.formModel.selectedWebcamDeviceId;
		this.firesideHostRtc.selectedMicDeviceId = this.formModel.selectedMicDeviceId;
		this.firesideHostRtc.selectedDesktopAudioDeviceId =
			this.formModel.selectedDesktopAudioDeviceId;
		this.firesideHostRtc.selectedGroupAudioDeviceId = this.formModel.selectedGroupAudioDeviceId;
	}

	@Watch('formModel.isStreaming')
	onIsStreamingChangeRequested() {
		if (this.formModel.isStreaming) {
			this.firesideHostRtc.startStreaming();
		} else {
			this.firesideHostRtc.stopStreaming();
		}

		// TODO: making formModel.isStreaming reactive to changes in firesideHostRtc.isStreaming
	}

	@Watch('firesideHostRtc.isStreaming', { immediate: true })
	onIsStreamingChanged() {
		this.setField('isStreaming', this.firesideHostRtc.isStreaming);
	}

	@Watch('firesideHostRtc.isPoorNetworkQuality')
	onNetworkQualityChanged() {
		if (!this.networkQualityDebounce) {
			this.networkQualityDebounce = debounce(() => {
				if (this.firesideHostRtc.isPoorNetworkQuality) {
					console.log('network quality is poor');
				} else {
					console.log('network quality is gud');
				}
			}, 3_000);
		}

		this.networkQualityDebounce();
	}
}
