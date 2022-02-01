import * as path from 'path';
import { getDeviceOS } from '../../device/device.service';
import { SettingAutostartClient } from '../../settings/settings.service';
import { Client } from '../client.service';
import { Autostarter } from '../client-voodoo-imports';

export class ClientAutoStart {
	static init() {
		if (SettingAutostartClient.get()) {
			this.set();
		}
	}

	static get canAutoStart() {
		if (GJ_BUILD_TYPE === 'development') {
			return false;
		}

		return getDeviceOS() === 'windows';
	}

	static async set() {
		if (!this.canAutoStart) {
			return;
		}

		return Autostarter.set(path.join(Client.joltronDir, 'GameJoltClient.exe'), [
			'run',
			'--',
			'--silent-start',
		]);
	}

	static async clear() {
		if (!this.canAutoStart) {
			return;
		}

		return Autostarter.unset();
	}

	static async check() {
		if (!this.canAutoStart) {
			return;
		}

		return Autostarter.isset();
	}
}
