import { UAParser } from 'ua-parser-js';

import { defineIsolatedState } from '~common/ssr/isolated-state';

export type DeviceOs = 'windows' | 'mac' | 'linux' | 'ios' | 'android' | 'other';
export type DeviceArch = '32' | '64';
export type DeviceType =
	| 'console'
	| 'mobile'
	| 'tablet'
	| 'smarttv'
	| 'wearable'
	| 'embedded'
	| 'client';

// Keep all these lowercase.
const OS_WINDOWS = ['windows', 'windows phone', 'windows mobile'];
const OS_MAC = ['mac os'];
const OS_LINUX = [
	'linux',
	'arch',
	'centos',
	'fedora',
	'debian',
	'gentoo',
	'gnu',
	'mageia',
	'mandriva',
	'mint',
	'pclinuxos',
	'redhat',
	'slackware',
	'suse',
	'ubuntu',
	'unix',
	'vectorlinux',
	'freebsd',
	'netbsd',
	'openbsd',
];
const OS_IOS = ['ios'];
const OS_ANDROID = ['android'];

const ARCH_32 = ['68k', 'arm', 'avr', 'ia32', 'irix', 'mips', 'pa-risc', 'ppc', 'sparc'];
const ARCH_64 = ['amd64', 'arm64', 'ia64', 'irix64', 'mips64', 'sparc64'];

const _cache = defineIsolatedState(() => ({
	userAgentOverride: undefined as string | undefined,
	parserResult: null as UAParser.IResult | null,
	os: undefined as DeviceOs | undefined,
	arch: undefined as DeviceArch | undefined,
	browser: undefined as string | undefined,
	deviceType: undefined as DeviceType | undefined,
	isDynamicGoogleBot: null as boolean | null,
}));

function _getResult() {
	const cache = _cache();
	if (!cache.parserResult) {
		const parser = new UAParser(cache.userAgentOverride);
		cache.parserResult = parser.getResult();
	}

	return cache.parserResult;
}

export function setDeviceUserAgent(newUserAgent: string) {
	const cache = _cache();
	if (cache.parserResult) {
		throw new Error(`Already parsed the UA result.`);
	}

	cache.userAgentOverride = newUserAgent;
}

export function getDeviceOS(): DeviceOs {
	if (GJ_IS_DESKTOP_APP) {
		const os = require('os') as typeof import('os');
		const type = os.type();
		if (type === 'Linux') {
			return 'linux';
		} else if (type === 'Darwin') {
			return 'mac';
		} else if (type === 'Windows_NT') {
			return 'windows';
		} else {
			return 'other';
		}
	}

	const cache = _cache();
	if (!cache.os) {
		const result = _getResult();
		const osName = result.os.name ? result.os.name.toLowerCase() : 'windows';

		if (OS_WINDOWS.indexOf(osName) !== -1) {
			cache.os = 'windows';
		} else if (OS_MAC.indexOf(osName) !== -1) {
			cache.os = 'mac';
		} else if (OS_LINUX.indexOf(osName) !== -1) {
			cache.os = 'linux';
		} else if (OS_ANDROID.indexOf(osName) !== -1) {
			cache.os = 'android';
		} else if (OS_IOS.indexOf(osName) !== -1) {
			cache.os = 'ios';
		} else {
			cache.os = 'other';
		}
	}

	return cache.os;
}

export function getDeviceArch(): DeviceArch {
	if (GJ_IS_DESKTOP_APP) {
		const arch = require('os').arch();

		// Because of a bug where 32-bit node versions will always report 32 instead of the OS arch.
		// http://blog.differentpla.net/blog/2013/03/10/processor-architew6432/
		if (getDeviceOS() === 'windows') {
			return arch === 'x64' ||
				Object.prototype.hasOwnProperty.call(process.env, 'PROCESSOR_ARCHITEW6432')
				? '64'
				: '32';
		}

		if (arch === 'x64') {
			return '64';
		} else if (arch === 'ia32') {
			return '32';
		}
	}

	const cache = _cache();
	if (typeof cache.arch === 'undefined') {
		const result = _getResult();
		const arch =
			result.cpu && result.cpu.architecture ? result.cpu.architecture.toLowerCase() : null;

		if (ARCH_64.indexOf(arch!) !== -1) {
			cache.arch = '64';
		} else if (ARCH_32.indexOf(arch!) !== -1) {
			cache.arch = '32';
		} else {
			cache.arch = '32';
		}
	}

	return cache.arch;
}

export function getDeviceBrowser(): string {
	if (GJ_IS_DESKTOP_APP) {
		return 'Client';
	}

	const cache = _cache();
	if (typeof cache.browser === 'undefined') {
		const result = _getResult();
		cache.browser = result.browser.name!;
	}

	return cache.browser;
}

export function getDeviceType(): DeviceType {
	if (GJ_IS_DESKTOP_APP) {
		return 'client';
	}

	const cache = _cache();
	if (typeof cache.deviceType === 'undefined') {
		const result = _getResult();
		cache.deviceType = result.device.type as DeviceType;
	}

	return cache.deviceType;
}

/**
 * Use this to specifically target GoogleBot's dynamic rendering. Note, this
 * just does detection against user agent. It's not static, so it won't tree
 * shake away anything in the build.
 *
 * @__NO_SIDE_EFFECTS__
 */
export function isDynamicGoogleBot() {
	if (GJ_IS_DESKTOP_APP || import.meta.env.SSR) {
		return false;
	}

	const cache = _cache();
	if (cache.isDynamicGoogleBot === null) {
		const result = _getResult();
		cache.isDynamicGoogleBot = /googlebot|google-inspectiontool/i.test(result.ua);
	}

	return cache.isDynamicGoogleBot;
}
