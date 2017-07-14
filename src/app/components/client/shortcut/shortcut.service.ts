import { Device } from '../../../../lib/gj-lib-client/components/device/device.service';
import { Shortcut } from 'client-voodoo';
import * as path from 'path';

export class ClientShortcut {
	static create() {
		// We just make ".desktop" entries for linux at the moment.
		// This way it's easier to launch them.
		if (Device.os() !== 'linux' || GJ_BUILD_TYPE === 'development') {
			return;
		}

		Shortcut.create(process.execPath, path.resolve(require('~/img/client/icon-256x256.png')));
	}
}
