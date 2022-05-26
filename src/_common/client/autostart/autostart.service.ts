import { getDeviceOS } from '../../device/device.service';
import { SettingAutostartClient } from '../../settings/settings.service';
import { Autostarter } from '../client-voodoo-imports';
import { Client } from '../client.service';

const path = require('path') as typeof import('path');

export class ClientAutoStart {
	static init() {
		if (SettingAutostartClient.get()) {
			this.set();
		}
	}

	static get canAutoStart() {
		// Autostarting is only viable when doing a full build.
		if (GJ_BUILD_TYPE !== 'build') {
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
