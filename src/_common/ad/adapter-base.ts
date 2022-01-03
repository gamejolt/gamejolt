import { Component } from 'vue';
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
		if (import.meta.env.SSR || this.ranOnce) {
			return;
		}

		cb();
		this.ranOnce = true;
	}
}
