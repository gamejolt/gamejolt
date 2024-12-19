import { Component } from 'vue';
import { isDynamicGoogleBot } from '../../device/device.service';
import { AdSlot } from '../ad-slot-info';
import { AdAdapter, AdAdapterHelper } from '../adapter-base';
import AppAdGptTakeover from './AppAdGptTakeover.vue';

export const AdGptTakeoverSlotId = 'div-gpt-ad-takeover';
export const AdGptMobileLeaderSlotId = 'div-gpt-ad-1734575238981-0';
export const AdGptMobileMidpageSlotId = 'div-gpt-ad-1734575381466-0';

export class AdGptAdapter implements AdAdapter {
	private helper = new AdAdapterHelper();

	private takeoverSlot = undefined as googletag.Slot | undefined;
	private mobileMidpageSlot = undefined as googletag.Slot | undefined;
	private mobileLeaderSlot = undefined as googletag.Slot | undefined;

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

				// Define the ad slots.
				this.takeoverSlot = googletag
					.defineOutOfPageSlot('/22547266442/site_takeover', AdGptTakeoverSlotId)!
					.addService(googletag.pubads());

				this.mobileMidpageSlot = googletag
					.defineSlot('/22547266442/mobile_mpu', [300, 250], AdGptMobileMidpageSlotId)!
					.addService(googletag.pubads());

				this.mobileLeaderSlot = googletag
					.defineSlot('/22547266442/mobile_leader', [320, 100], AdGptMobileLeaderSlotId)!
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
		return this.takeoverSlot!;
	}

	getMobileMidpageGptSlot() {
		return this.mobileMidpageSlot!;
	}

	getMobileLeaderGptSlot() {
		return this.mobileLeaderSlot!;
	}

	component(_slot: AdSlot): Component {
		return AppAdGptTakeover;
	}
}
