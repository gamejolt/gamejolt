import { reactive } from '@vue/reactivity';
import { UAParser } from 'ua-parser-js';

type DeviceOs = 'windows' | 'mac' | 'linux' | 'other';
type DeviceArch = '32' | '64';

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

const ARCH_32 = ['68k', 'arm', 'avr', 'ia32', 'irix', 'mips', 'pa-risc', 'ppc', 'sparc'];
const ARCH_64 = ['amd64', 'arm64', 'ia64', 'irix64', 'mips64', 'sparc64'];

class DeviceData {
	userAgent?: string;
	os?: DeviceOs;
	arch?: DeviceArch;
	browser?: string;
}

const _device = reactive(new DeviceData()) as DeviceData;
let _parserResult: null | IUAParser.IResult = null;

function _getResult() {
	if (!_parserResult) {
		const parser = new UAParser(_device.userAgent);
		_parserResult = parser.getResult();
	}

	return _parserResult;
}

export function setDeviceUserAgent(userAgent: string) {
	if (_parserResult) {
		throw new Error(`Already parsed the UA result.`);
	}

	_device.userAgent = userAgent;
}

export function getDeviceOS(): DeviceOs {
	if (GJ_IS_CLIENT) {
		const os = require('os');
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

	if (!_device.os) {
		const result = _getResult();
		const osName = result.os.name ? result.os.name.toLowerCase() : 'windows';

		if (OS_WINDOWS.indexOf(osName) !== -1) {
			_device.os = 'windows';
		} else if (OS_MAC.indexOf(osName) !== -1) {
			_device.os = 'mac';
		} else if (OS_LINUX.indexOf(osName) !== -1) {
			_device.os = 'linux';
		} else {
			_device.os = 'other';
		}
	}

	return _device.os;
}

export function getDeviceArch(): DeviceArch {
	if (GJ_IS_CLIENT) {
		const arch = require('os').arch();

		// Because of a bug where 32-bit node versions will always report 32 instead of the OS arch.
		// http://blog.differentpla.net/blog/2013/03/10/processor-architew6432/
		if (getDeviceOS() === 'windows') {
			return arch === 'x64' || process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432')
				? '64'
				: '32';
		}

		if (arch === 'x64') {
			return '64';
		} else if (arch === 'ia32') {
			return '32';
		}
	}

	if (typeof _device.arch === 'undefined') {
		const result = _getResult();
		const arch =
			result.cpu && result.cpu.architecture ? result.cpu.architecture.toLowerCase() : null;

		if (ARCH_64.indexOf(arch!) !== -1) {
			_device.arch = '64';
		} else if (ARCH_32.indexOf(arch!) !== -1) {
			_device.arch = '32';
		} else {
			_device.arch = '32';
		}
	}

	return _device.arch;
}

export function getDeviceBrowser() {
	if (GJ_IS_CLIENT) {
		return 'Client';
	}

	if (typeof _device.browser === 'undefined') {
		const result = _getResult();
		_device.browser = result.browser.name as string;
	}

	return _device.browser;
}
