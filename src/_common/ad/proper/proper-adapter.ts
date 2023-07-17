import { Component } from 'vue';
import { loadScript } from '../../../utils/utils';
import { isDynamicGoogleBot } from '../../device/device.service';
import { AdSlot } from '../ad-slot-info';
import { AdAdapterBase } from '../adapter-base';
import AppAdProper from './AppAdProper.vue';

export const ProperTagUnits = {
	side: ['side_1', 'side_2'],
	leaderboard: ['leaderboard'],
	content: [
		'content_1',
		'content_2',
		'content_3',
		'content_4',
		'content_5',
		'content_6',
		'content_7',
		'content_8',
		'content_9',
		'content_10',
	],
};

export type ProperTagPlacement = keyof typeof ProperTagUnits;

export class AdProperAdapter extends AdAdapterBase {
	tagUnits = { ...ProperTagUnits };

	component(_slot: AdSlot): Component {
		return AppAdProper;
	}

	run(cb: () => void) {
		if (import.meta.env.SSR || isDynamicGoogleBot()) {
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

		(window as any).propertag.cmd.push(() => {
			try {
				cb();
			} catch (e) {
				console.warn('Proper: Failed to execute Proper function call.', e);
			}
		});
	}

	onBeforeRouteChange() {
		this.run(() => {
			(window as any).properSpaNewPage();
		});
	}

	getTagUnit(placement: ProperTagPlacement) {
		return this.tagUnits[placement]?.shift() ?? null;
	}

	releaseTagUnit(placement: ProperTagPlacement, tagUnit: string) {
		this.tagUnits[placement].unshift(tagUnit);
	}
}
