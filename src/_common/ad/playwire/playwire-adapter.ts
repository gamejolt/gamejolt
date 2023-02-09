import { Component } from 'vue';
import { loadScript, MaybePromise } from '../../../utils/utils';
import { AdSlot } from '../ad-slot-info';
import { AdAdapterBase } from '../adapter-base';
import AppAdPlaywire from './AppAdPlaywire.vue';
import AppAdPlaywireVideo from './AppAdPlaywireVideo.vue';

export class AdPlaywireAdapter extends AdAdapterBase {
	hasVideoSupport = true;

	component(slot: AdSlot): Component {
		return slot.size === 'video' ? AppAdPlaywireVideo : AppAdPlaywire;
	}

	ensureLoaded() {
		this.runOnce(() => {
			(window as any).ramp = {
				mode: 'ramp',
				que: [],
				passiveMode: true,
			};

			loadScript('https://cdn.intergient.com/1391/30391/ramp.js');
		});
	}

	run(cb: (ramp: any) => MaybePromise<void>) {
		if (import.meta.env.SSR) {
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

	onBeforeRouteChange(): void {
		this.run(ramp => {
			ramp.destroyUnits('all');
		});
	}
}
