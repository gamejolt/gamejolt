const path = require('path') as typeof import('path');
import { getDeviceOS } from '../../device/device.service';
import { Shortcut } from '../client-voodoo-imports';
import { Client } from '../client.service';

export class ClientShortcut {
	static get supportsShortcuts() {
		// Installing shortcuts is only viable when doing a full build
		if (GJ_BUILD_TYPE !== 'build') {
			return false;
		}
		// We just make ".desktop" entries for linux at the moment.
		// This way it's easier to launch them.
		return getDeviceOS() === 'linux';
	}

	static create() {
		if (!this.supportsShortcuts) {
			return;
		}

		return Shortcut.create(
			path.join(Client.joltronDir, 'game-jolt-client'),
			path.resolve(Client.nwStaticAssetsDir, 'client-icon-256x256.png')
		);
	}

	static remove() {
		if (!this.supportsShortcuts) {
			return;
		}

		return Shortcut.remove();
	}
}
