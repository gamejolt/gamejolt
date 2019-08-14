import { UAParser } from 'ua-parser-js';
import { makeObservableService } from '../../utils/vue';

type DeviceOs = 'windows' | 'mac' | 'linux' | 'other';
type DeviceArch = '32' | '64';

export class Device {
	static ua?: string;

	private static _result?: IUAParser.IResult;
	private static _os?: DeviceOs;
	private static _arch?: DeviceArch;
	private static _browser?: string;

	// Keep all these lowercase.
	static readonly OS_WINDOWS = ['windows', 'windows phone', 'windows mobile'];

	static readonly OS_MAC = ['mac os'];

	static readonly OS_LINUX = [
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

	static readonly ARCH_32 = [
		'68k',
		'arm',
		'avr',
		'ia32',
		'irix',
		'mips',
		'pa-risc',
		'ppc',
		'sparc',
	];

	static readonly ARCH_64 = ['amd64', 'arm64', 'ia64', 'irix64', 'mips64', 'sparc64'];

	private static _getResult() {
		if (!this._result) {
			const parser = new UAParser(this.ua);
			this._result = parser.getResult();
		}

		return this._result;
	}

	static os(): DeviceOs {
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

		if (!this._os) {
			const result = this._getResult();
			const osName = result.os.name ? result.os.name.toLowerCase() : 'windows';

			if (Device.OS_WINDOWS.indexOf(osName) !== -1) {
				this._os = 'windows';
			} else if (Device.OS_MAC.indexOf(osName) !== -1) {
				this._os = 'mac';
			} else if (Device.OS_LINUX.indexOf(osName) !== -1) {
				this._os = 'linux';
			} else {
				this._os = 'other';
			}
		}

		return this._os;
	}

	static arch(): DeviceArch {
		if (GJ_IS_CLIENT) {
			const arch = require('os').arch();

			// Because of a bug where 32-bit node versions will always report 32 instead of the OS arch.
			// http://blog.differentpla.net/blog/2013/03/10/processor-architew6432/
			if (this.os() === 'windows') {
				return arch === 'x64' || process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432') ? '64' : '32';
			}

			if (arch === 'x64') {
				return '64';
			} else if (arch === 'ia32') {
				return '32';
			}
		}

		if (typeof this._arch === 'undefined') {
			const result = this._getResult();
			const arch =
				result.cpu && result.cpu.architecture ? result.cpu.architecture.toLowerCase() : null;

			if (Device.ARCH_64.indexOf(arch!) !== -1) {
				this._arch = '64';
			} else if (Device.ARCH_32.indexOf(arch!) !== -1) {
				this._arch = '32';
			} else {
				this._arch = '32';
			}
		}

		return this._arch;
	}

	static browser() {
		if (GJ_IS_CLIENT) {
			return 'Client';
		}

		if (typeof this._browser === 'undefined') {
			const result = this._getResult();
			this._browser = result.browser.name as string;
		}

		return this._browser;
	}
}

makeObservableService(Device);
