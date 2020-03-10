import { loadScript } from '../../../utils/utils';
import { AdSlot } from '../ad-slot-info';
import { AdAdapterBase } from '../adapter-base';
import AppAdProper from './proper.vue';

export const ProperTagUnits = {
	side: ['side_1', 'side_2'],
	leaderboard: ['leaderboard'],
	content: ['content_1', 'content_2', 'content_3', 'content_4'],
};

export class AdProperAdapter extends AdAdapterBase {
	tagUnits = { ...ProperTagUnits };

	component(_slot: AdSlot) {
		return AppAdProper;
	}

	run(cb: () => void) {
		if (GJ_IS_SSR) {
			return;
		}

		this.runOnce(() => {
			const w = window as any;

			// https://proper-media.groovehq.com/help/single-page-applications-prefetch-implementation
			w.special_ops = {
				spa_settings: {
					enabled: true,
					prefetch: false,
				},
			};

			w.propertag = w.propertag || {};
			w.propertag.cmd = w.propertag.cmd || [];
			loadScript('https://global.proper.io/gamejolt.min.js');
		});

		(window as any).propertag.cmd.push(cb);
	}

	// onBeforeRouteChange() {
	// 	// Reset the tag units so that we reset the slot IDs back to the
	// 	// beginning.
	// 	// console.log('resetting tag units');
	// 	// this.tagUnits = { ...ProperTagUnits };
	// }

	onRouteChanged() {
		this.run(() => {
			console.log('new page');
			(window as any).properSpaNewPage();
		});
	}
}
