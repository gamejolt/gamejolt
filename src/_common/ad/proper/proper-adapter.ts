import type { Component } from 'vue';
import { loadScript } from '../../../utils/utils';
import { isDynamicGoogleBot } from '../../device/device.service';
import { AdSlot } from '../ad-slot-info';
import { AdAdapter, AdAdapterHelper } from '../adapter-base';
import AppAdProper from './AppAdProper.vue';

export const ProperTagUnits = {
	side: ['side_1', 'side_2'],
	skyscraper: ['side_rail_dynamic'],
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

export class AdProperAdapter implements AdAdapter {
	private helper = new AdAdapterHelper();
	tagUnits = { ...ProperTagUnits };

	component(_slot: AdSlot): Component {
		return AppAdProper;
	}

	/**
	 * Will return true if we are loading the script, or false if the script
	 * won't be loaded.
	 */
	ensureLoaded() {
		if (import.meta.env.SSR || isDynamicGoogleBot()) {
			return false;
		}

		this.helper.runOnce(() => {
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

		return true;
	}

	run(cb: () => void) {
		if (!this.ensureLoaded()) {
			return;
		}

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

	onRouteChanged() {}

	getTagUnit(placement: ProperTagPlacement) {
		return this.tagUnits[placement]?.shift() ?? null;
	}

	releaseTagUnit(placement: ProperTagPlacement, tagUnit: string) {
		this.tagUnits[placement].unshift(tagUnit);
	}
}
