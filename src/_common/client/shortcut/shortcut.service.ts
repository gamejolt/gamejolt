import { Shortcut } from 'client-voodoo';
import * as path from 'path';

import { Device } from '../../../lib/gj-lib-client/components/device/device.service';

export class ClientShortcut {
	static get supportsShortcuts() {
		// We just make ".desktop" entries for linux at the moment.
		// This way it's easier to launch them.
		if (Device.os() !== 'linux' || GJ_BUILD_TYPE === 'development') {
			return false;
		}
		return true;
	}

	static create() {
		if (!this.supportsShortcuts) {
			return;
		}

		return Shortcut.create(
			process.execPath,
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
