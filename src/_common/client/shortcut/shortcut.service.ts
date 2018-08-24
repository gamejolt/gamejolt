import { Shortcut } from 'client-voodoo';
import * as path from 'path';

import { Device } from '../../../lib/gj-lib-client/components/device/device.service';

export class ClientShortcut {
	static get supportsShortcuts() {
		if (GJ_IS_WATCHING) {
			return false;
		}
		// We just make ".desktop" entries for linux at the moment.
		// This way it's easier to launch them.
		return Device.os() === 'linux';
	}

	static create() {
		if (!this.supportsShortcuts) {
			return;
		}

		return Shortcut.create(
			path.join(nw.App.startPath, '..', 'game-jolt-client'),
			// Path is absolute, so we make it relative to get the resolve working.
			path.resolve(require('../../../static-assets/client/icon-256x256.png').substr(1))
		);
	}

	static remove() {
		if (!this.supportsShortcuts) {
			return;
		}

		return Shortcut.remove();
	}
}
