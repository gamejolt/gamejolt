import AgoraRTC from 'agora-rtc-sdk-ng';
import { makeObservableService } from '../../utils/vue';
import { EventTopic } from '../system/event/event-topic';

export type MediaDeviceType = 'webcam' | 'mic' | 'speaker';

export type DetectionOptions = {
	/**
	 * If `true`, will not attempt detecting if was already prompted.
	 *
	 * This is `true` by default.
	 */
	skipIfPrompted: boolean;

	/**
	 * If `true`, will prompt the user for permission to access the media devices if needed.
	 * If the user already granted access, the prompt will not show.
	 *
	 * This is `true` by default.
	 */
	prompt: boolean;
};

const DefaultDetectionOptions = <DetectionOptions>{
	skipIfPrompted: true,
	prompt: true,
};

export abstract class MediaDeviceService {
	private static p_webcamsWasPrompted = false;
	private static p_webcams: readonly MediaDeviceInfo[] = [];
	private static p_webcamsPermissionError = false;

	private static p_micsWasPrompted = false;
	private static p_mics: readonly MediaDeviceInfo[] = [];
	private static p_micsPermissionError = false;

	private static p_speakersWasPrompted = false;
	private static p_speakers: readonly MediaDeviceInfo[] = [];
	private static p_speakersPermissionError = false;

	static get webcams() {
		return this.p_webcams;
	}

	static get hasWebcamPermissions() {
		return (
			this.p_webcams.length !== 0 ||
			(this.p_webcamsWasPrompted && !this.p_webcamsPermissionError)
		);
	}

	static get webcamPermissionsWerePrompted() {
		return this.p_webcamsWasPrompted;
	}

	static get mics() {
		return this.p_mics;
	}

	static get hasMicPermissions() {
		return this.p_mics.length !== 0 || (this.p_micsWasPrompted && !this.p_micsPermissionError);
	}

	static get micPermissionsWerePrompted() {
		return this.p_micsWasPrompted;
	}

	static get speakers() {
		return this.p_speakers;
	}

	static get hasSpeakerPermissions() {
		return (
			this.p_speakers.length !== 0 ||
			(this.p_speakersWasPrompted && !this.p_speakersPermissionError)
		);
	}

	static get speakerPermissionsWerePrompted() {
		return this.p_speakersWasPrompted;
	}

	static async detectDevices(options?: Partial<DetectionOptions>) {
		await Promise.all([
			this.detectWebcams(options),
			this.detectMics(options),
			this.detectSpeakers(options),
		]);
	}

	static async detectWebcams(options?: Partial<DetectionOptions>): Promise<void> {
		const effectiveOptions = {
			...DefaultDetectionOptions,
			...(options || {}),
		};

		console.log('detecting webcams', effectiveOptions);

		if (this.p_webcamsWasPrompted && effectiveOptions.skipIfPrompted) {
			console.log('skipping because was already prompted');
			return;
		}
		this.p_webcamsWasPrompted ||= effectiveOptions.prompt;

		try {
			const cameras = await AgoraRTC.getCameras(!effectiveOptions.prompt);
			this.p_webcams = Object.freeze(
				cameras
					.filter(
						// Only get devices if we managed to fetch info for them.
						deviceInfo => deviceInfo.deviceId && deviceInfo.label && deviceInfo.kind
					)
					.map(deviceInfo => Object.freeze(deviceInfo.toJSON()))
			);
			this.p_webcamsPermissionError = false;
			console.log('Got webcams: ', this.p_webcams);
		} catch (e) {
			console.warn('Error while getting webcams: ', e);
			this.p_webcams = [];
			this.p_webcamsPermissionError = this.isPermissionError(e);
		}
	}

	static async detectMics(options?: Partial<DetectionOptions>): Promise<void> {
		const effectiveOptions = {
			...DefaultDetectionOptions,
			...(options || {}),
		};

		console.log('detecting mics', effectiveOptions);

		if (this.p_micsWasPrompted && effectiveOptions.skipIfPrompted) {
			console.log('skipping because was already prompted');
			return;
		}
		this.p_micsWasPrompted ||= effectiveOptions.prompt;

		try {
			const mics = await AgoraRTC.getMicrophones(!effectiveOptions.prompt);
			this.p_mics = Object.freeze(
				mics
					.filter(
						// Only get devices if we managed to fetch info for them.
						deviceInfo => deviceInfo.deviceId && deviceInfo.label && deviceInfo.kind
					)
					.map(deviceInfo => Object.freeze(deviceInfo.toJSON()))
			);
			this.p_micsPermissionError = false;
			console.log('Got mics: ', this.p_mics);
		} catch (e) {
			console.warn('Error while getting mics: ', e);
			this.p_mics = [];
			this.p_micsPermissionError = this.isPermissionError(e);
		}
	}

	static async detectSpeakers(options?: Partial<DetectionOptions>): Promise<void> {
		const effectiveOptions = {
			...DefaultDetectionOptions,
			...(options || {}),
		};

		console.log('detecting speakers', effectiveOptions);

		if (this.p_speakersWasPrompted && effectiveOptions.skipIfPrompted) {
			console.log('skipping because was already prompted');
			return;
		}
		this.p_speakersWasPrompted ||= effectiveOptions.prompt;

		try {
			const speakers = await AgoraRTC.getPlaybackDevices(!effectiveOptions.prompt);
			this.p_speakers = Object.freeze(
				speakers
					.filter(
						// Only get devices if we managed to fetch info for them.
						deviceInfo => deviceInfo.deviceId && deviceInfo.label && deviceInfo.kind
					)
					.map(deviceInfo => Object.freeze(deviceInfo.toJSON()))
			);
			this.p_speakersPermissionError = false;
			console.log('Got speakers: ', this.p_speakers);
		} catch (e) {
			console.warn('Error while getting speakers: ', e);
			this.p_speakers = [];
			this.p_speakersPermissionError = this.isPermissionError(e);
		}
	}

	private static asAgoraError(e: any): { name: 'AgoraRTCException'; code: string } | null {
		const isAgoraError =
			typeof e === 'object' &&
			Object.prototype.hasOwnProperty.call(e, 'name') &&
			Object.prototype.hasOwnProperty.call(e, 'code') &&
			e.name === 'AgoraRTCException';

		return isAgoraError ? e : null;
	}

	private static isPermissionError(e: any) {
		return this.asAgoraError(e)?.code === 'PERMISSION_DENIED';
	}
}

makeObservableService(MediaDeviceService);

export const MediaDeviceObserver = new EventTopic<MediaDeviceType>();

AgoraRTC.onCameraChanged = async () => {
	await MediaDeviceService.detectWebcams({ prompt: false, skipIfPrompted: false });
	MediaDeviceObserver.next('webcam');
};

AgoraRTC.onMicrophoneChanged = async () => {
	await MediaDeviceService.detectMics({ prompt: false, skipIfPrompted: false });
	MediaDeviceObserver.next('mic');
};

AgoraRTC.onPlaybackDeviceChanged = async () => {
	await MediaDeviceService.detectSpeakers({ prompt: false, skipIfPrompted: false });
	MediaDeviceObserver.next('speaker');
};
