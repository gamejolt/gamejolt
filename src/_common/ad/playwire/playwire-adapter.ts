import { loadScript } from '../../../utils/utils';
import { AdSlot } from '../ad-slot-info';
import { AdAdapterBase } from '../adapter-base';
import AppAdPlaywire from './AppAdPlaywire.vue';
import AppAdPlaywireVideo from './AppAdPlaywireVideo.vue';

export class AdPlaywireAdapter extends AdAdapterBase {
	hasVideoSupport = true;

	component(slot: AdSlot) {
		return slot.size === 'video' ? AppAdPlaywireVideo : AppAdPlaywire;
	}

	ensureLoaded() {
		this.runOnce(() => {
			(window as any).tyche = {
				mode: 'tyche',
				config: 'https://config.playwire.com/1391/v2/websites/30391/banner.json',
				observerMode: {
					enabled: true,
					selector: 'root',
				},
			};

			loadScript('https://cdn.intergi.com/hera/tyche.js');
		});
	}
}
