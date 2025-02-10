import { isDynamicGoogleBot } from '../../device/device.service';
import { AdAdapter, AdAdapterHelper } from '../adapter-base';

export const AdGptTakeoverSlotId = 'div-gpt-ad-takeover';
export const AdGptMobileLeaderSlotId = 'div-gpt-ad-1734575238981-0';
export const AdGptMobileMidpageSlotId = 'div-gpt-ad-1734575381466-0';

const NativePostSlotIdPrefix = 'div-gpt-ad-native-post-';
const NativeSlotCount = 10;

export class AdGptAdapter implements AdAdapter {
	private helper = new AdAdapterHelper();

	private takeoverSlot = undefined as googletag.Slot | undefined;
	private mobileMidpageSlot = undefined as googletag.Slot | undefined;
	private mobileLeaderSlot = undefined as googletag.Slot | undefined;
	private nativePostSlotIds: string[] = [];
	private nativePostSlots = new Map<(typeof this.nativePostSlotIds)[number], googletag.Slot>();

	constructor() {
		// We construct an array of slot IDs that we'll modify as ad units come
		// and go.
		for (let i = 1; i <= NativeSlotCount; ++i) {
			this.nativePostSlotIds.push(`${NativePostSlotIdPrefix}${i}`);
		}
	}

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

				// Make a map of all the native post slot IDs to their actual slots.
				for (let i = 1; i <= NativeSlotCount; ++i) {
					const id = `${NativePostSlotIdPrefix}${i}`;
					this.nativePostSlots.set(
						id,
						googletag
							.defineOutOfPageSlot(`/22547266442/native_post_${i + 1}`, id)!
							.addService(googletag.pubads())
					);
				}

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

	getTakeoverSlot() {
		return this.takeoverSlot!;
	}

	getMobileMidpageSlot() {
		return this.mobileMidpageSlot!;
	}

	getMobileLeaderSlot() {
		return this.mobileLeaderSlot!;
	}

	getNativePostSlot() {
		return this.nativePostSlotIds.shift() ?? null;
	}

	releaseNativePostSlot(slotId: string) {
		this.nativePostSlotIds.unshift(slotId);
	}

	/**
	 * Will return a GPT slot for the given slot ID if it exists.
	 */
	resolveNativePostSlot(slotId: string) {
		return this.nativePostSlots.get(slotId);
	}
}
