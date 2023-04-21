import { computed, ref, Ref, shallowReadonly } from 'vue';
import { createLogger } from '../../utils/logging';
import { configCanStreamDesktopVideo } from '../config/config.service';
import { getDeviceBrowser } from '../device/device.service';
import { hasDesktopVideoCaptureSupport } from './rtc/device-capabilities';
import { PRODUCER_DESKTOP_VIDEO_DEVICE_ID } from './rtc/producer';

const logger = createLogger('MediaDeviceService');

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

/**
 * Getting devices directly through Agora doesn't work after closing the initial
 * MediaStreams on some browsers (Firefox). To fix, all we need to do is call
 * [navigator.mediaDevices.getUserMedia] with the device types we want to
 * request.
 *
 * https://stackoverflow.com/questions/46648645/navigator-mediadevices-enumeratedevices-not-display-device-label-on-firefox
 */
async function _getUserMedia() {
	if (GJ_IS_DESKTOP_APP || import.meta.env.SSR) {
		return;
	}

	return navigator.mediaDevices.getUserMedia({
		audio: true,
		video: true,
	});
}

async function _getDevicesOfKind(kind: MediaDeviceKind): Promise<MediaDeviceInfo[]> {
	return (await navigator.mediaDevices.enumerateDevices())
		.filter(
			// Only get devices if we managed to fetch info for them.
			device => device.kind === kind && device.deviceId && device.label
		)
		.map(device => Object.freeze(device.toJSON()));
}

// TODO(oven): we might need to interface with the Permissions API to figure out
// if we need to prompt for permissions or something?

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

	// React when devices change.
	navigator.mediaDevices.addEventListener('devicechange', () => {
		detectDevices();
	});

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
		const hasPrompted =
			micsWasPrompted.value && speakersWasPrompted.value && webcamsWasPrompted.value;

		// Firefox doesn't return the label for devices after closing a
		// MediaStream - we need to request temp access to devices again.
		if (hasPrompted && getDeviceBrowser().toLowerCase().indexOf('firefox') !== -1) {
			await _getUserMedia();
		}

		await Promise.all([detectWebcams(options), detectMics(options), detectSpeakers(options)]);
	}

	async function detectWebcams(options?: Partial<DetectionOptions>): Promise<void> {
		const effectiveOptions = {
			...DefaultDetectionOptions,
			...(options || {}),
		};

		logger.info('detecting webcams', effectiveOptions);

		if (webcamsWasPrompted.value && effectiveOptions.skipIfPrompted) {
			logger.info('skipping because was already prompted');
			return;
		}

		try {
			let filteredCameras: MediaDeviceInfo[] = [];

			// We fake a webcam for their desktop video capture if
			// they are using a device that would support it.
			if (hasDesktopVideoCaptureSupport && configCanStreamDesktopVideo.value) {
				filteredCameras.push(<MediaDeviceInfo>{
					deviceId: PRODUCER_DESKTOP_VIDEO_DEVICE_ID,
					groupId: PRODUCER_DESKTOP_VIDEO_DEVICE_ID,
					kind: 'videoinput',
					label: 'Desktop video capture',
				});
			}

			filteredCameras = filteredCameras.concat(await _getDevicesOfKind('videoinput'));

			webcams.value = Object.freeze(filteredCameras);
			webcamsPermissionError.value = false;
			logger.info('Got webcams: ', webcams.value);
		} catch (e) {
			logger.warn('Error while getting webcams: ', e);
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

		logger.info('detecting mics', effectiveOptions);

		if (micsWasPrompted.value && effectiveOptions.skipIfPrompted) {
			logger.info('skipping because was already prompted');
			return;
		}

		try {
			mics.value = Object.freeze(await _getDevicesOfKind('audioinput'));
			micsPermissionError.value = false;
			logger.info('Got mics: ', mics.value);
		} catch (e) {
			logger.warn('Error while getting mics: ', e);
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

		logger.info('detecting speakers', effectiveOptions);

		if (speakersWasPrompted.value && effectiveOptions.skipIfPrompted) {
			logger.info('skipping because was already prompted');
			return;
		}

		try {
			speakers.value = Object.freeze(await _getDevicesOfKind('audiooutput'));
			speakersPermissionError.value = false;
			logger.info('Got speakers: ', speakers.value);
		} catch (e) {
			logger.warn('Error while getting speakers: ', e);
			speakers.value = [];
			speakersPermissionError.value = _isPermissionError(e);
		} finally {
			speakersWasPrompted.value ||= effectiveOptions.prompt;
		}
	}

	function _isPermissionError(e: any) {
		// TODO(oven): is there a way to check for permission error?
		logger.error('Error while getting devices: ', e);
		// return e?.code === 'PERMISSION_DENIED';
		return true;
	}
	return shallowReadonly({
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
		detectMics,
		detectSpeakers,
	});
}

export const MediaDeviceService = createMediaDeviceService();
