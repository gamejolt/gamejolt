import { Shortcut } from 'client-voodoo';
import * as path from 'path';
import iconPath from '../../../static-assets/client/icon-256x256.png';
import { getDeviceOS } from '../../device/device.service';
import { Client } from '../client.service';

export class ClientShortcut {
	static get supportsShortcuts() {
		if (GJ_BUILD_TYPE === 'development') {
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
			// TODO(vue3): we need to make sure this still works
			// Path is absolute, so we make it relative to get the resolve working.
			path.resolve(iconPath.substr(1))
		);
	}

	static remove() {
		if (!this.supportsShortcuts) {
			return;
		}

		return Shortcut.remove();
	}
}
