import Vue from 'vue';
import { AdSlot } from './ad-slot-info';

export abstract class AdAdapterBase {
	private ranOnce = false;
	hasVideoSupport = false;

	abstract component(slot: AdSlot): typeof Vue;

	/**
	 * Convenience method to run something just once for this adapter. Most
	 * likely an adapter would use this to load the ad script just once on the
	 * first ad display (lazy initialization).
	 */
	protected runOnce(cb: () => void) {
		if (this.ranOnce) {
			return;
		}

		cb();
		this.ranOnce = true;
	}
}
