import { Component } from 'vue';
import { isDynamicGoogleBot } from '../../device/device.service';
import { AdSlot } from '../ad-slot-info';
import { AdAdapter, AdAdapterHelper } from '../adapter-base';
import AppAdGptTakeover from './AppAdGptTakeover.vue';

export const AdGptTakeoverSlotId = 'div-gpt-ad-takeover';

export class AdGptAdapter implements AdAdapter {
	private helper = new AdAdapterHelper();

	private gptSlots = {
		takeover: undefined as googletag.Slot | undefined,
	};

	run(cb: () => void) {
		if (import.meta.env.SSR || isDynamicGoogleBot()) {
			return;
		}

		this.helper.runOnce(() => {
			// TODO: Right now Proper.io is loading GPT for us. Once that's gone, we
			// should use this.
			// loadScript('https://securepubads.g.doubleclick.net/tag/js/gpt.js', {
			// 	crossOrigin: 'anonymous',
			// });

			window.googletag = window.googletag || { cmd: [] };

			googletag.cmd.push(() => {
				// Disable initial load. This prevents GPT from automatically
				// fetching ads when display is called.
				googletag.pubads().disableInitialLoad();

				// Define the ad slot.
				this.gptSlots.takeover = googletag
					.defineOutOfPageSlot('/22547266442/site_takeover', AdGptTakeoverSlotId)!
					.addService(googletag.pubads());

				googletag.enableServices();
			});
		});

		googletag.cmd.push(() => {
			try {
				cb();
			} catch (e) {
				console.warn('GPT: Failed to execute function call.', e);
			}
		});
	}

	onBeforeRouteChange() {}

	onRouteChanged() {}

	getTakeoverGptSlot() {
		return this.gptSlots.takeover!;
	}

	component(_slot: AdSlot): Component {
		return AppAdGptTakeover;
	}
}
