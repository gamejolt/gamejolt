import { Autostarter } from 'client-voodoo';

import { Device } from '../../../lib/gj-lib-client/components/device/device.service';
import { Settings } from '../../settings/settings.service';
import * as path from 'path';
import { Client } from '../client.service';

export class ClientAutoStart {
	static init() {
		if (Settings.get('autostart-client')) {
			this.set();
		}
	}

	static get canAutoStart() {
		if (GJ_IS_WATCHING) {
			return false;
		}

		return Device.os() === 'windows';
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
