import { AdPageType } from '~common/ad/ad-page-view';
import { AdUnitName } from '~common/ad/ad-slot-info';
import { defineAdAdapter } from '~common/ad/adapter-base';
import { loadScript } from '~utils/utils';

type AdBridgCommand = {
	action: 'spa_pv_initialize';
	config: {
		pagetype: AdPageType;
		loggedIn: boolean;
		allowAds: boolean;
		targeting: Record<string, string | string[]>;
	};
};

declare global {
	interface Window {
		AdBridg?: { cmd: { push: (command: AdBridgCommand) => void } };
	}
}

export type AdBridgSlotTarget = {
	id: string;
	adClass: string;
	maxWidth?: number;
	maxHeight?: number;
};

type AdBridgSlotDefinition = {
	/**
	 * The part of AdBridg's ad class that comes after the device prefix.
	 */
	slot: string;
	maxWidth?: number;
	maxHeight?: number;
};

/**
 * How our unit names map to AdBridg's slots. The container size is the biggest
 * ad that can render in the slot. A missing unit isn't shown for that device.
 */
const DesktopSlots: Partial<Record<AdUnitName, AdBridgSlotDefinition>> = {
	leaderboard: { slot: 'lb', maxWidth: 970, maxHeight: 250 },
	sidebar: { slot: 'rail-left', maxWidth: 300, maxHeight: 600 },
	incontent: { slot: 'incontent', maxWidth: 336, maxHeight: 280 },
	instream: { slot: 'instream' },
};

const MobileSlots: Partial<Record<AdUnitName, AdBridgSlotDefinition>> = {
	leaderboard: { slot: 'lb', maxWidth: 320, maxHeight: 100 },
	incontent: { slot: 'incontent', maxWidth: 336, maxHeight: 280 },
	instream: { slot: 'instream' },
};

export type AdBridgAdapter = ReturnType<typeof createAdBridgAdapter>;

export function createAdBridgAdapter() {
	/**
	 * Counts each slot so that we can give them all unique IDs. We never reset
	 * these, since slots can stay mounted through a route change.
	 */
	const slotCounts = new Map<string, number>();

	function _push(command: AdBridgCommand) {
		window.AdBridg ??= { cmd: [] };
		window.AdBridg.cmd.push(command);
	}

	/**
	 * Gets the target that AdBridg will render the ad into. Returns null if the
	 * unit shouldn't show on this device.
	 */
	function getSlotTarget(unitName: AdUnitName, isMobile: boolean): AdBridgSlotTarget | null {
		const definition = (isMobile ? MobileSlots : DesktopSlots)[unitName];
		if (!definition) {
			return null;
		}

		const devicePrefix = isMobile ? 'mb' : 'dt';
		const adClass = `adb-gj-${devicePrefix}-${definition.slot}`;
		const count = (slotCounts.get(adClass) ?? 0) + 1;
		slotCounts.set(adClass, count);

		return {
			id: `${devicePrefix}-${definition.slot}-${count}`,
			adClass,
			maxWidth: definition.maxWidth,
			maxHeight: definition.maxHeight,
		};
	}

	return defineAdAdapter({
		provider: 'adbridg',
		getSlotTarget,
		init() {
			// They queue commands until their scripts load in.
			window.AdBridg ??= { cmd: [] };
			(window as any).googletag ??= { cmd: [] };

			// These only need to load once since we're an SPA.
			loadScript('https://prod.adspsp.com/adb.4814234.min.js');
			loadScript('https://securepubads.g.doubleclick.net/tag/js/gpt.js');
		},
		onBeforeRouteChange() {},
		onPageView({ pageType, loggedIn, allowAds, targetingTags }) {
			// AdBridg restarts the ad lifecycle for the page on every push, so
			// a correction is the same as a normal page view for them.
			_push({
				action: 'spa_pv_initialize',
				config: {
					pagetype: pageType,
					loggedIn,
					allowAds,
					targeting: {
						loggedIn: loggedIn ? 'true' : 'false',
						tt: targetingTags,
					},
				},
			});
		},
	});
}
