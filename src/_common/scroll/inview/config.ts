import { ScrollInviewEmitsOn } from './inview';

export class ScrollInviewConfig {
	/**
	 * The margin will effectively get added to the bounding box of this element
	 * to make it larger or smaller. It should be in the format of a CSS margin
	 * property and always have the "px" after each value.
	 * Note: This is not reactive.
	 */
	margin = '0px';

	/**
	 * The emits-on prop determines when the inview and outview events emit. Possible values:
	 *	'partial-overlap' (default value)
	 *		inview - emits when the element comes partially in view.
	 *		outview - emits when the element goes completely out of view.
	 *	'full-overlap'
	 *		inview - emits when the element comes in view fully.
	 *		outview - emits when the element goes partially out of view.
	 */
	emitsOn: ScrollInviewEmitsOn = 'partial-overlap';

	/**
	 * Whether or not we should be tracking the most focused element within the
	 * elements attached to this config.
	 */
	trackFocused = false;

	constructor(config?: Partial<ScrollInviewConfig>) {
		if (config) {
			Object.assign(this, config);
		}
	}
}
