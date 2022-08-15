import { UAParser } from 'ua-parser-js';
import { ref } from 'vue';

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

const _userAgent = ref<string>();
const _os = ref<DeviceOs>();
const _arch = ref<DeviceArch>();
const _browser = ref<string>();
const _deviceType = ref<DeviceType>();

let _parserResult: null | IUAParser.IResult = null;

function _getResult() {
	if (!_parserResult) {
		const parser = new UAParser(_userAgent.value);
		_parserResult = parser.getResult();
	}

	return _parserResult;
}

export function setDeviceUserAgent(newUserAgent: string) {
	if (_parserResult) {
		throw new Error(`Already parsed the UA result.`);
	}

	_userAgent.value = newUserAgent;
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

	if (!_os.value) {
		const result = _getResult();
		console.log(result.os);
		const osName = result.os.name ? result.os.name.toLowerCase() : 'windows';

		if (OS_WINDOWS.indexOf(osName) !== -1) {
			_os.value = 'windows';
		} else if (OS_MAC.indexOf(osName) !== -1) {
			_os.value = 'mac';
		} else if (OS_LINUX.indexOf(osName) !== -1) {
			_os.value = 'linux';
		} else if (OS_ANDROID.indexOf(osName) !== -1) {
			_os.value = 'android';
		} else if (OS_IOS.indexOf(osName) !== -1) {
			_os.value = 'ios';
		} else {
			_os.value = 'other';
		}
	}

	return _os.value;
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

	if (typeof _arch.value === 'undefined') {
		const result = _getResult();
		const arch =
			result.cpu && result.cpu.architecture ? result.cpu.architecture.toLowerCase() : null;

		if (ARCH_64.indexOf(arch!) !== -1) {
			_arch.value = '64';
		} else if (ARCH_32.indexOf(arch!) !== -1) {
			_arch.value = '32';
		} else {
			_arch.value = '32';
		}
	}

	return _arch.value;
}

export function getDeviceBrowser(): string {
	if (GJ_IS_DESKTOP_APP) {
		return 'Client';
	}

	if (typeof _browser.value === 'undefined') {
		const result = _getResult();
		_browser.value = result.browser.name!;
	}

	return _browser.value;
}

export function getDeviceType(): DeviceType {
	if (GJ_IS_DESKTOP_APP) {
		return 'client';
	}

	if (typeof _deviceType.value === 'undefined') {
		const result = _getResult();
		_deviceType.value = result.device.type as DeviceType;
	}

	return _deviceType.value;
}
