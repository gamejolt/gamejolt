import { defineAdAdapter } from '~common/ad/adapter-base';
import { loadScript } from '~utils/utils';

/**
 * Slots register with the adapter so that it can tell them to load in a new ad
 * when the page changes.
 */
export type MonetizeMoreSlot = { display: () => void };

export type MonetizeMoreAdapter = ReturnType<typeof createMonetizeMoreAdapter>;

export function createMonetizeMoreAdapter() {
	const slots = new Set<MonetizeMoreSlot>();
	let isPageResolved = false;
	let isLoaded = false;

	/**
	 * We lazy load the script on the first ad display.
	 */
	function ensureLoaded() {
		if (isLoaded) {
			return;
		}

		isLoaded = true;
		loadScript('https://c.pubguru.net/pg.gamejolt.js');
	}

	function addSlot(slot: MonetizeMoreSlot) {
		slots.add(slot);

		// If the page already resolved then this slot was mounted after the
		// fact. We have to call the initial display.
		if (isPageResolved) {
			slot.display();
		}
	}

	function removeSlot(slot: MonetizeMoreSlot) {
		slots.delete(slot);
	}

	function _setTargetingTags(tags: string[]) {
		const anyWindow = window as any;
		anyWindow.pg = anyWindow.pg || {};
		anyWindow.pg.kvps = anyWindow.pg.kvps || {};

		for (const tag of tags) {
			anyWindow.pg.kvps[`tt_${tag}`] = '1';
		}
	}

	return defineAdAdapter({
		provider: 'monetizemore',
		ensureLoaded,
		addSlot,
		removeSlot,
		init() {},
		onBeforeRouteChange() {
			isPageResolved = false;
		},
		onPageView({ targetingTags }, { isCorrection }) {
			// Slots react to page settings changing on their own, so we don't
			// want to regenerate them on a correction.
			if (isCorrection) {
				return;
			}

			if (targetingTags.length) {
				console.info('Setting MonetizeMore targeting tags:', targetingTags);
				_setTargetingTags(targetingTags);
			}

			isPageResolved = true;

			// Each slot loads in a new ad for the new page.
			for (const slot of slots) {
				slot.display();
			}
		},
	});
}
