import type { Component, PropType } from 'vue';
import { isDynamicGoogleBot } from '../device/device.service';
import { AdSlot } from './ad-slot-info';

export abstract class AdAdapterBase {
	private ranOnce = false;
	hasVideoSupport = false;

	abstract component(slot: AdSlot): Component;

	// Callbacks.
	onBeforeRouteChange() {}
	onRouteChanged() {}

	/**
	 * Convenience method to run something just once for this adapter. Most
	 * likely an adapter would use this to load the ad script just once on the
	 * first ad display (lazy initialization).
	 */
	protected runOnce(cb: () => void) {
		if (import.meta.env.SSR || isDynamicGoogleBot() || this.ranOnce) {
			return;
		}

		cb();
		this.ranOnce = true;
	}
}

/**
 * Used to define the common interface for all ad adapter components. These are
 * always passed into every ad adapter's components to display the actual ads.
 */
export function defineAdAdapterComponentProps<T extends AdAdapterBase>() {
	return {
		adSlot: {
			type: Object as PropType<AdSlot>,
			required: true,
		},
		adapter: {
			type: Object as PropType<T>,
			required: true,
		},
	} as const;
}
