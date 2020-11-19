/**
 * This is essentially managed by ScrollInviewContainer as the element this
 * controller is attached to goes into and out of view.
 */
export class ScrollInviewController {
	isInview: null | boolean = null;
	isFocused: null | boolean = null;

	/**
	 * The Y position of the element on the page.
	 */
	y = 0;

	/**
	 * Latest threshold that has crossed. We keep track of each "quarter"
	 * crossed, as well as fully in view and fully out of view.
	 */
	latestThreshold = 0;
}
