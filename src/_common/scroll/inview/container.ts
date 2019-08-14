import 'rxjs/add/operator/throttleTime';
import { Scroll } from '../scroll.service';
import { ScrollWatcher } from '../watcher.service';
import { AppScrollInview } from './inview';

/**
 * When the scroll velocity is below this minimum distance in px, we will check inview items every
 * ScrollThrottleTime. This ensures that if they're scrolling constantly, but really slowly, we'll be
 * able to do the checks even though debounce won't fire.
 */
const DefaultScrollVelocityMinimum = 2000;
const DefaultScrollThrottleTime = 300;

export class ScrollInviewContainer {
	items: AppScrollInview[] = [];

	private lastScrollTop = 0;
	private lastThrottleTime = Date.now();
	private lastScrollHeight?: number;
	private queueTimeout?: number;

	get context() {
		return this.scrollWatcher.context;
	}

	constructor(
		private readonly scrollWatcher: ScrollWatcher,
		private readonly throttle = DefaultScrollThrottleTime,
		private readonly velocity = DefaultScrollVelocityMinimum
	) {
		if (GJ_IS_SSR) {
			return;
		}

		this.scrollWatcher.stop.subscribe(() => this.check());

		// If we don't want a throttle, then simply watch every scroll change.
		if (this.throttle !== 0) {
			this.scrollWatcher.changes
				.throttleTime(this.throttle)
				.subscribe(() => this.onScrollThrottle());
		} else {
			this.scrollWatcher.changes.subscribe(() => this.check());
		}
	}

	private onScrollThrottle() {
		const now = Date.now();
		const scrollTop = Scroll.getScrollTop();
		const deltaDistance = scrollTop - this.lastScrollTop;
		const deltaTime = (now - this.lastThrottleTime) / 1000;
		const velocity = deltaDistance / deltaTime;

		if (Math.abs(velocity) < this.velocity) {
			this.check();
		}

		this.lastThrottleTime = now;
		this.lastScrollTop = scrollTop;
	}

	queueCheck() {
		// Since a check was queued, it means something probably changed. Let's reset the scroll
		// watcher's cached scroll changes so we get fresh data.
		this.scrollWatcher.resetScrollChange();

		if (this.queueTimeout) {
			return;
		}

		this.queueTimeout = setTimeout(() => {
			// We force a recalc of all the items.
			this.check(true);
			this.queueTimeout = undefined;
		});
	}

	private check(forceRecalc?: boolean) {
		const { top, height, scrollHeight } = this.scrollWatcher.getScrollChange();

		// We only calculate the bounding box when scroll height changes. This reduces the amount of
		// reflows and what not.
		const shouldRecalc = forceRecalc || this.lastScrollHeight !== scrollHeight;

		for (const item of this.items) {
			if (shouldRecalc) {
				item.recalcBox();
			}

			let inView = true;
			if (item.top > top + height) {
				inView = false;
			} else if (item.bottom < top) {
				inView = false;
			}

			// Update the item with its new in-view state.
			if (inView !== item.inView) {
				item.inView = inView;
			}
		}

		this.lastScrollHeight = scrollHeight;
	}
}
