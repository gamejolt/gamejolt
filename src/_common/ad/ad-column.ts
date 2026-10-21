import { inject, InjectionKey, Ref } from 'vue';

/**
 * The side column of the page that an ad is rendered in. This is where it
 * actually shows on screen, which isn't always the slot it was placed in. For
 * example, a page container combines its left slot into the right column on
 * smaller screens.
 */
export type AdColumn = 'left' | 'right';

export const AdColumnKey: InjectionKey<Ref<AdColumn>> = Symbol('ad-column');

/**
 * Returns null when the ad isn't within a side column.
 */
export function useAdColumn() {
	return inject(AdColumnKey, null);
}
