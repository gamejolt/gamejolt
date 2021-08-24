import { Component, Prop, Watch } from 'vue-property-decorator';
import { debounce } from '../../../../utils/utils';
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

	private networkQualityDebounce: () => void = null as any;

	$refs!: {
		form: AppForm;
		videoPreview?: HTMLDivElement;
	};

	onInit() {
		this.setField('selectedWebcamDeviceId', this.firesideHostRtc.selectedWebcamDeviceId);
		this.setField('selectedMicDeviceId', this.firesideHostRtc.selectedMicDeviceId);
		this.setField(
			'selectedDesktopAudioDeviceId',
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

	get selectedMicGroupId() {
		return this.mics.find(i => i.deviceId == this.formModel.selectedMicDeviceId)?.groupId;
	}

	get selectedDesktopAudioGroupId() {
		return this.mics.find(i => i.deviceId == this.formModel.selectedDesktopAudioDeviceId)
			?.groupId;
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
			!this.webcams.find(i => i.deviceId == this.formModel.selectedWebcamDeviceId) &&
			!this.mics.find(
				i =>
					i.deviceId == this.formModel.selectedMicDeviceId ||
					i.deviceId == this.formModel.selectedDesktopAudioDeviceId
			)
		);
	}

	@Watch('isInvalidConfig')
	onInvalidConfigChanged() {
		if (this.isInvalidConfig && this.formModel.isStreaming) {
			this.firesideHostRtc.stopStreaming();
		}
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
