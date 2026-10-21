/**
 * Where on the page an ad slot is placed. Each ad adapter maps these to its own
 * ad units.
 *
 * - leaderboard: wide banner at the top of a page.
 * - rail: tall unit in a page's side column. Which side it's on comes from the
 *   column it renders in, see `AdColumn`.
 * - rail-mpu: medium rectangle in a page's side column.
 * - gutter: narrow rail in the page gutter, only on very wide screens.
 * - incontent: repeating unit within feeds, grids and lists.
 * - instream: 16:9 video unit.
 */
export type AdUnitName = 'leaderboard' | 'rail' | 'rail-mpu' | 'gutter' | 'incontent' | 'instream';

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
