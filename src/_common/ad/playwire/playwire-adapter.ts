import { Component } from 'vue';
import { loadScript } from '../../../utils/utils';
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
}
