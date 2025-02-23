import { isDynamicGoogleBot } from '../../device/device.service';
import { AdAdapter, AdAdapterHelper } from '../adapter-base';

export const AdGptSiteTakeoverSlotId = 'div-gpt-ad-site-takeover';
export const AdGptLoginTakeoverSlotId = 'div-gpt-ad-login-takeover';
export const AdGptMobileLeaderSlotId = 'div-gpt-ad-1734575238981-0';
export const AdGptMobileMidpageSlotId = 'div-gpt-ad-1734575381466-0';

const NativePostSlotIdPrefix = 'div-gpt-ad-native-post-';
const NativePostAdUnitPrefix = '/22547266442/native_post/native_post_';
const NativePostCount = 10;

type AdGptNativePostInfo = {
	id: string;
	slotId: string;
};

export class AdGptAdapter implements AdAdapter {
	private helper = new AdAdapterHelper();

	private siteTakeoverSlot = undefined as googletag.Slot | undefined;
	private loginTakeoverSlot = undefined as googletag.Slot | undefined;
	private mobileMidpageSlot = undefined as googletag.Slot | undefined;
	private mobileLeaderSlot = undefined as googletag.Slot | undefined;
	private nativePosts: AdGptNativePostInfo[] = [];
	private nativePostSlots = new Map<AdGptNativePostInfo['id'], googletag.Slot>();

	constructor() {
		// We construct an array of slot IDs that we'll modify as ad units come
		// and go.
		for (let i = 1; i <= NativePostCount; ++i) {
			this.nativePosts.push({
				id: `${NativePostSlotIdPrefix}${i}`,
				slotId: `${NativePostAdUnitPrefix}${i}`,
			});
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

				this.siteTakeoverSlot = googletag
					.defineOutOfPageSlot('/22547266442/site_takeover', AdGptSiteTakeoverSlotId)!
					.addService(googletag.pubads());

				this.loginTakeoverSlot = googletag
					.defineOutOfPageSlot('/22547266442/login_takeover', AdGptLoginTakeoverSlotId)!
					.addService(googletag.pubads());

				// Make a map of all the native post slot IDs to their actual
				// slots. Don't iterate over the native posts array, since that
				// gets modified before GPT loads in.
				for (let i = 1; i <= NativePostCount; ++i) {
					const id = `${NativePostSlotIdPrefix}${i}`;
					this.nativePostSlots.set(
						id,
						googletag
							.defineOutOfPageSlot(`${NativePostAdUnitPrefix}${i}`, id)!
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

	getSiteTakeoverSlot() {
		return this.siteTakeoverSlot!;
	}

	getLoginTakeoverSlot() {
		return this.loginTakeoverSlot!;
	}

	getMobileMidpageSlot() {
		return this.mobileMidpageSlot!;
	}

	getMobileLeaderSlot() {
		return this.mobileLeaderSlot!;
	}

	lockNativePost() {
		return this.nativePosts.shift() ?? null;
	}

	releaseNativePost(slotInfo: AdGptNativePostInfo) {
		this.nativePosts.unshift(slotInfo);
	}

	/**
	 * Will return a GPT slot for the given slot ID if it exists.
	 */
	resolveNativePostSlot(slotInfo: AdGptNativePostInfo) {
		return this.nativePostSlots.get(slotInfo.id);
	}
}
