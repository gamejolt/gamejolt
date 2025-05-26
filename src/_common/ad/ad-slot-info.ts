export type AdUnit = 'halfpage' | 'rail' | 'billboard' | 'mpu';

export type AdSlotSize = 'rectangle' | 'leaderboard' | 'video' | 'skyscraper';

export type AdSlotPlacement = 'content' | 'side' | 'top';

export class AdSlot {
	/**
	 * Whether this slot is currently showing a native post or takeover ad.
	 */
	showingCustom = false;

	constructor(
		public readonly size: AdSlotSize,
		public readonly placement: AdSlotPlacement,
		public readonly takeover: boolean,
		public readonly nativePost: boolean
	) {}
}
