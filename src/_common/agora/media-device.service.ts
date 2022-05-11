import { reactive } from 'vue';
import { importNoSSR } from '../code-splitting';

const AgoraRTCLazy = importNoSSR(async () => (await import('agora-rtc-sdk-ng')).default);

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

class _MediaDeviceService {
	private p_webcamsWasPrompted = false;
	private p_webcams: readonly MediaDeviceInfo[] = [];
	private p_webcamsPermissionError = false;

	private p_micsWasPrompted = false;
	private p_mics: readonly MediaDeviceInfo[] = [];
	private p_micsPermissionError = false;

	private p_speakersWasPrompted = false;
	private p_speakers: readonly MediaDeviceInfo[] = [];
	private p_speakersPermissionError = false;

	get webcams() {
		return this.p_webcams;
	}

	get hasWebcamPermissions() {
		return (
			this.p_webcams.length !== 0 ||
			(this.p_webcamsWasPrompted && !this.p_webcamsPermissionError)
		);
	}

	get webcamPermissionsWerePrompted() {
		return this.p_webcamsWasPrompted;
	}

	get mics() {
		return this.p_mics;
	}

	get hasMicPermissions() {
		return this.p_mics.length !== 0 || (this.p_micsWasPrompted && !this.p_micsPermissionError);
	}

	get micPermissionsWerePrompted() {
		return this.p_micsWasPrompted;
	}

	get speakers() {
		return this.p_speakers;
	}

	get hasSpeakerPermissions() {
		return (
			this.p_speakers.length !== 0 ||
			(this.p_speakersWasPrompted && !this.p_speakersPermissionError)
		);
	}

	get speakerPermissionsWerePrompted() {
		return this.p_speakersWasPrompted;
	}

	async detectDevices(options?: Partial<DetectionOptions>) {
		await Promise.all([
			this.detectWebcams(options),
			this.detectMics(options),
			this.detectSpeakers(options),
		]);
	}

	async detectWebcams(options?: Partial<DetectionOptions>): Promise<void> {
		const effectiveOptions = {
			...DefaultDetectionOptions,
			...(options || {}),
		};

		console.log('detecting webcams', effectiveOptions);

		if (this.p_webcamsWasPrompted && effectiveOptions.skipIfPrompted) {
			console.log('skipping because was already prompted');
			return;
		}

		try {
			const AgoraRTC = await AgoraRTCLazy;
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
		} finally {
			this.p_webcamsWasPrompted ||= effectiveOptions.prompt;
		}
	}

	async detectMics(options?: Partial<DetectionOptions>): Promise<void> {
		const effectiveOptions = {
			...DefaultDetectionOptions,
			...(options || {}),
		};

		console.log('detecting mics', effectiveOptions);

		if (this.p_micsWasPrompted && effectiveOptions.skipIfPrompted) {
			console.log('skipping because was already prompted');
			return;
		}

		try {
			const AgoraRTC = await AgoraRTCLazy;
			const mics = await AgoraRTC.getMicrophones(!effectiveOptions.prompt);
			this.p_mics = Object.freeze([
				...mics
					.filter(
						// Only get devices if we managed to fetch info for them.
						deviceInfo => deviceInfo.deviceId && deviceInfo.label && deviceInfo.kind
					)
					.map(deviceInfo => Object.freeze(deviceInfo.toJSON())),
				{
					deviceId: 'fake-desktop-audio',
					groupId: 'fake-desktop-audio',
					kind: 'audioinput',
					label: 'Desktop Audio',
				},
			]);
			this.p_micsPermissionError = false;
			console.log('Got mics: ', this.p_mics);
		} catch (e) {
			console.warn('Error while getting mics: ', e);
			this.p_mics = [];
			this.p_micsPermissionError = this.isPermissionError(e);
		} finally {
			this.p_micsWasPrompted ||= effectiveOptions.prompt;
		}
	}

	async detectSpeakers(options?: Partial<DetectionOptions>): Promise<void> {
		const effectiveOptions = {
			...DefaultDetectionOptions,
			...(options || {}),
		};

		console.log('detecting speakers', effectiveOptions);

		if (this.p_speakersWasPrompted && effectiveOptions.skipIfPrompted) {
			console.log('skipping because was already prompted');
			return;
		}

		try {
			const AgoraRTC = await AgoraRTCLazy;
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
		} finally {
			this.p_speakersWasPrompted ||= effectiveOptions.prompt;
		}
	}

	private asAgoraError(e: any): { name: 'AgoraRTCException'; code: string } | null {
		const isAgoraError =
			typeof e === 'object' &&
			Object.prototype.hasOwnProperty.call(e, 'name') &&
			Object.prototype.hasOwnProperty.call(e, 'code') &&
			e.name === 'AgoraRTCException';

		return isAgoraError ? e : null;
	}

	private isPermissionError(e: any) {
		return this.asAgoraError(e)?.code === 'PERMISSION_DENIED';
	}
}

export const MediaDeviceService = reactive(new _MediaDeviceService()) as _MediaDeviceService;

AgoraRTCLazy.then(AgoraRTC => {
	AgoraRTC.onCameraChanged = async () => {
		await MediaDeviceService.detectWebcams({ prompt: false, skipIfPrompted: false });
	};

	AgoraRTC.onMicrophoneChanged = async () => {
		await MediaDeviceService.detectMics({ prompt: false, skipIfPrompted: false });
	};

	AgoraRTC.onPlaybackDeviceChanged = async () => {
		await MediaDeviceService.detectSpeakers({ prompt: false, skipIfPrompted: false });
	};
});
