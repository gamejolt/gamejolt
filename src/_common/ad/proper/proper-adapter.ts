import { loadScript } from '../../../utils/utils';
import { AdSlot } from '../ad-slot-info';
import { AdAdapterBase } from '../adapter-base';
import AppAdProper from './proper.vue';

export type AdProperAdapterPlacement = 'leaderboard' | 'content_1' | 'side_1' | 'sticky_1';

export class AdProperAdapter extends AdAdapterBase {
	tagCounts: Record<AdProperAdapterPlacement, number> = {
		leaderboard: 1,
		content_1: 1,
		side_1: 1,
		sticky_1: 1,
	};

	component(_slot: AdSlot) {
		return AppAdProper;
	}

	ensureLoaded() {
		this.runOnce(() => {
			const w = window as any;
			w.propertag = w.propertag || {};
			w.propertag.cmd = w.propertag.cmd || [];
			loadScript('https://global.proper.io/gamejolt.min.js');
		});
	}
}
