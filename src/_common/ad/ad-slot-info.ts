export type AdUnitName = 'halfpage' | 'rail' | 'billboard' | 'mpu';

export class AdSlot {
	/**
	 * Whether this slot is currently showing a native post or takeover ad.
	 */
	showingCustom = false;

	constructor(
		public readonly unitName: AdUnitName,
		public readonly takeover: boolean,
		public readonly nativePost: boolean
	) {}
}
