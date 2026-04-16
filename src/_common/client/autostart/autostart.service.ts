import { Client } from '~common/client/client.service';
import { Autostarter } from '~common/client/client-voodoo-imports';
import { getDeviceOS } from '~common/device/device.service';
import { SettingAutostartClient } from '~common/settings/settings.service';

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
