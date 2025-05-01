import type { Component } from 'vue';
import { loadScript } from '../../../utils/utils';
import { isDynamicGoogleBot } from '../../device/device.service';
import { AdSlot } from '../ad-slot-info';
import { AdAdapter, AdAdapterHelper } from '../adapter-base';
import AppAdMonetizeMore from './AppAdMonetizeMore.vue';

export const MonetizeMoreTagUnits = {
	side: 'halfpage',
	skyscraper: 'rail',
	leaderboard: 'billboard',
	content: 'mpu',
};

export type MonetizeMoreTagPlacement = keyof typeof MonetizeMoreTagUnits;

export class AdMonetizeMoreAdapter implements AdAdapter {
	private helper = new AdAdapterHelper();
	tagUnits = { ...MonetizeMoreTagUnits };

	component(_slot: AdSlot): Component {
		return AppAdMonetizeMore;
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
			loadScript('https://c.pubguru.net/pg.gamejolt.js');
		});

		return true;
	}

	onBeforeRouteChange() {}
	onRouteChanged() {}

	getDesktopTagUnit(placement: MonetizeMoreTagPlacement) {
		return this.tagUnits[placement];
	}
}
