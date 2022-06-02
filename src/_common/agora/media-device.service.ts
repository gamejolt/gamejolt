import { computed, ref, Ref } from 'vue';
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

function createMediaDeviceService() {
	const webcamsWasPrompted = ref(false);
	const webcams = ref([]) as Ref<readonly MediaDeviceInfo[]>;
	const webcamsPermissionError = ref(false);

	const micsWasPrompted = ref(false);
	const mics = ref([]) as Ref<readonly MediaDeviceInfo[]>;
	const micsPermissionError = ref(false);

	const speakersWasPrompted = ref(false);
	const speakers = ref([]) as Ref<readonly MediaDeviceInfo[]>;
	const speakersPermissionError = ref(false);

	const hasWebcamPermissions = computed(
		() =>
			webcams.value.length !== 0 ||
			(webcamsWasPrompted.value && !webcamsPermissionError.value)
	);

	const hasMicPermissions = computed(
		() => mics.value.length !== 0 || (micsWasPrompted.value && !micsPermissionError.value)
	);

	const hasSpeakerPermissions = computed(
		() =>
			speakers.value.length !== 0 ||
			(speakersWasPrompted.value && !speakersPermissionError.value)
	);

	async function detectDevices(options?: Partial<DetectionOptions>) {
		await Promise.all([detectWebcams(options), detectMics(options), detectSpeakers(options)]);
	}

	async function detectWebcams(options?: Partial<DetectionOptions>): Promise<void> {
		const effectiveOptions = {
			...DefaultDetectionOptions,
			...(options || {}),
		};

		console.log('detecting webcams', effectiveOptions);

		if (webcamsWasPrompted.value && effectiveOptions.skipIfPrompted) {
			console.log('skipping because was already prompted');
			return;
		}

		try {
			const AgoraRTC = await AgoraRTCLazy;
			const newCameras = await AgoraRTC.getCameras(!effectiveOptions.prompt);
			webcams.value = Object.freeze(
				newCameras
					.filter(
						// Only get devices if we managed to fetch info for them.
						deviceInfo => deviceInfo.deviceId && deviceInfo.label && deviceInfo.kind
					)
					.map(deviceInfo => Object.freeze(deviceInfo.toJSON()))
			);
			webcamsPermissionError.value = false;
			console.log('Got webcams: ', webcams.value);
		} catch (e) {
			console.warn('Error while getting webcams: ', e);
			webcams.value = [];
			webcamsPermissionError.value = _isPermissionError(e);
		} finally {
			webcamsWasPrompted.value ||= effectiveOptions.prompt;
		}
	}

	async function detectDisplays(options?: Partial<DetectionOptions>): Promise<void> {
		const effectiveOptions = {
			...DefaultDetectionOptions,
			...(options || {}),
		};

		console.log('detecting webcams', effectiveOptions);

		if (webcamsWasPrompted.value && effectiveOptions.skipIfPrompted) {
			console.log('skipping because was already prompted');
			return;
		}

		try {
			const AgoraRTC = await AgoraRTCLazy;
			const newCameras = await AgoraRTC.getCameras(!effectiveOptions.prompt);
			webcams.value = Object.freeze(
				newCameras
					.filter(
						// Only get devices if we managed to fetch info for them.
						deviceInfo => deviceInfo.deviceId && deviceInfo.label && deviceInfo.kind
					)
					.map(deviceInfo => Object.freeze(deviceInfo.toJSON()))
			);
			webcamsPermissionError.value = false;
			console.log('Got webcams: ', webcams.value);
		} catch (e) {
			console.warn('Error while getting webcams: ', e);
			webcams.value = [];
			webcamsPermissionError.value = _isPermissionError(e);
		} finally {
			webcamsWasPrompted.value ||= effectiveOptions.prompt;
		}
	}

	async function detectMics(options?: Partial<DetectionOptions>): Promise<void> {
		const effectiveOptions = {
			...DefaultDetectionOptions,
			...(options || {}),
		};

		console.log('detecting mics', effectiveOptions);

		if (micsWasPrompted.value && effectiveOptions.skipIfPrompted) {
			console.log('skipping because was already prompted');
			return;
		}

		try {
			const AgoraRTC = await AgoraRTCLazy;
			const newMics = await AgoraRTC.getMicrophones(!effectiveOptions.prompt);
			mics.value = Object.freeze([
				...newMics
					.filter(
						// Only get devices if we managed to fetch info for them.
						deviceInfo => deviceInfo.deviceId && deviceInfo.label && deviceInfo.kind
					)
					.map(deviceInfo => Object.freeze(deviceInfo.toJSON())),
			]);
			micsPermissionError.value = false;
			console.log('Got mics: ', mics.value);
		} catch (e) {
			console.warn('Error while getting mics: ', e);
			mics.value = [];
			micsPermissionError.value = _isPermissionError(e);
		} finally {
			micsWasPrompted.value ||= effectiveOptions.prompt;
		}
	}

	async function detectSpeakers(options?: Partial<DetectionOptions>): Promise<void> {
		const effectiveOptions = {
			...DefaultDetectionOptions,
			...(options || {}),
		};

		console.log('detecting speakers', effectiveOptions);

		if (speakersWasPrompted.value && effectiveOptions.skipIfPrompted) {
			console.log('skipping because was already prompted');
			return;
		}

		try {
			const AgoraRTC = await AgoraRTCLazy;
			const newSpeakers = await AgoraRTC.getPlaybackDevices(!effectiveOptions.prompt);
			speakers.value = Object.freeze(
				newSpeakers
					.filter(
						// Only get devices if we managed to fetch info for them.
						deviceInfo => deviceInfo.deviceId && deviceInfo.label && deviceInfo.kind
					)
					.map(deviceInfo => Object.freeze(deviceInfo.toJSON()))
			);
			speakersPermissionError.value = false;
			console.log('Got speakers: ', speakers.value);
		} catch (e) {
			console.warn('Error while getting speakers: ', e);
			speakers.value = [];
			speakersPermissionError.value = _isPermissionError(e);
		} finally {
			speakersWasPrompted.value ||= effectiveOptions.prompt;
		}
	}

	function _isPermissionError(e: any) {
		return _asAgoraError(e)?.code === 'PERMISSION_DENIED';
	}

	function _asAgoraError(e: any): { name: 'AgoraRTCException'; code: string } | null {
		const isAgoraError =
			typeof e === 'object' &&
			Object.prototype.hasOwnProperty.call(e, 'name') &&
			Object.prototype.hasOwnProperty.call(e, 'code') &&
			e.name === 'AgoraRTCException';

		return isAgoraError ? e : null;
	}

	return {
		webcamsWasPrompted: computed(() => webcamsWasPrompted.value),
		webcams: computed(() => webcams.value),
		webcamsPermissionError: computed(() => webcamsPermissionError.value),

		micsWasPrompted: computed(() => micsWasPrompted.value),
		mics: computed(() => mics.value),
		micsPermissionError: computed(() => micsPermissionError.value),

		speakersWasPrompted: computed(() => speakersWasPrompted.value),
		speakers: computed(() => speakers.value),
		speakersPermissionError: computed(() => speakersPermissionError.value),

		hasWebcamPermissions,
		hasMicPermissions,
		hasSpeakerPermissions,

		detectDevices,
		detectWebcams,
		detectDisplays,
		detectMics,
		detectSpeakers,
	};
}

export const MediaDeviceService = createMediaDeviceService();

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
