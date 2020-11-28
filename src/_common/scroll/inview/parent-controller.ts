import { ScrollInviewConfig } from './config';
import { ScrollInviewContainer } from './container';

export const ScrollInviewParentKey = Symbol('scroll-inview-parent');

export class ScrollInviewParentController {
	constructor(private readonly getScroller: () => null | HTMLElement) {}

	/**
	 * We need to create a new container for each unique configuration that our
	 * AppScrollInview children need.
	 */
	private containers = new Map<ScrollInviewConfig, ScrollInviewContainer>();

	/**
	 * We need a different container for each unique "margin" that we need to
	 * watch for. This function will return a container for the specific margin
	 * passed in. If it doesn't have one yet for the specific margin, it will
	 * dynamically create one.
	 */
	getContainer(config: ScrollInviewConfig) {
		const container = this.containers.get(config);
		if (!container) {
			const root = this.getScroller();
			const newContainer = new ScrollInviewContainer(config, root);
			this.containers.set(config, newContainer);
			return newContainer;
		}

		return container;
	}
}
