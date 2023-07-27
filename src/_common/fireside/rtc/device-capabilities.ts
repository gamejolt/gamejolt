import { run } from '../../../utils/utils';
import { getDeviceArch, getDeviceOS } from '../../device/device.service';

/**
 * Whether or not we can capture desktop audio.
 */
export const hasDesktopAudioCaptureSupport = /** @__PURE__ */ run(() => {
	if (!GJ_IS_DESKTOP_APP) {
		return false;
	}

	if (getDeviceOS() !== 'windows' || getDeviceArch() !== '64') {
		return false;
	}

	const os = require('os') as typeof import('os');
	const releaseInfo = os.release().split('.');
	if (releaseInfo.length < 2) {
		return false;
	}

	let winVer: number | null = null;
	let buildNum: number | null = null;

	try {
		winVer = parseInt(releaseInfo[0]);
		buildNum = parseInt(releaseInfo[releaseInfo.length - 1]);
	} catch (e) {}

	if (winVer === null || buildNum === null) {
		return false;
	}

	return winVer > 10 || (winVer == 10 && buildNum >= 19043);
});

/**
 * Whether or not we're able to capture video from their desktop.
 */
export const hasDesktopVideoCaptureSupport = GJ_IS_DESKTOP_APP;
