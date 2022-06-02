import { getDeviceOS } from '../../device/device.service';

/**
 * Whether or not we can capture desktop audio.
 */
export const hasDesktopAudioCaptureSupport = GJ_IS_DESKTOP_APP && getDeviceOS() === 'windows';
