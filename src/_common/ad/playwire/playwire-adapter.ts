import type { Component } from 'vue';
import { loadScript, MaybePromise } from '../../../utils/utils';
import { isDynamicGoogleBot } from '../../device/device.service';
import { AdSlot } from '../ad-slot-info';
import { AdAdapter, AdAdapterHelper } from '../adapter-base';
import AppAdPlaywireVideo from './AppAdPlaywireVideo.vue';

export class AdPlaywireAdapter implements AdAdapter {
	private helper = new AdAdapterHelper();

	component(_slot: AdSlot): Component {
		return AppAdPlaywireVideo;
	}

	ensureLoaded() {
		this.helper.runOnce(() => {
			(window as any).ramp = {
				mode: 'ramp',
				que: [],
				passiveMode: true,
			};

			loadScript('https://cdn.intergient.com/1391/30391/ramp.js');
		});
	}

	run(cb: (ramp: any) => MaybePromise<void>) {
		if (import.meta.env.SSR || isDynamicGoogleBot()) {
			return;
		}

		this.ensureLoaded();

		const ramp = (window as any).ramp;

		ramp.que.push(async () => {
			try {
				await cb(ramp);
			} catch (e) {
				console.warn('Playwire: Failed to execute Playwire function call.', e);
			}
		});
	}

	onBeforeRouteChange() {
		this.run(ramp => {
			ramp.destroyUnits('all');
		});
	}

	onRouteChanged() {}
}
