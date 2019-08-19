import { Subject } from 'rxjs/Subject';
import { supportsPassiveEvents } from '../../utils/detection';
import { Scroll, ScrollContext } from './scroll.service';

/**
 * How long to wait after scrolling before we emit the scroll stop observable.
 */
const ScrollStopDebounceTime = 500;

export interface ScrollChange {
	top: number;
	left: number;
	height: number;
	width: number;
	scrollHeight: number;
	scrollWidth: number;
}

export class ScrollWatcher {
	changes = new Subject<void>();
	start = new Subject<void>();
	stop = new Subject<void>();

	private isScrolling = false;
	private scrollListener: EventListener;
	private cachedScrollChange: ScrollChange | null = null;
	private scrollStopTimeout: NodeJS.Timer | null = null;

	constructor(public readonly context: ScrollContext) {
		this.scrollListener = () => {
			this.resetScrollChange();
			this.changes.next();

			// As soon as we start scrolling, emit the scrollStart.
			if (!this.isScrolling) {
				this.isScrolling = true;
				this.start.next();
			}

			// Wait a bit of time of not scrolling before we emit scrollStop.
			if (this.scrollStopTimeout) {
				clearTimeout(this.scrollStopTimeout);
			}

			this.scrollStopTimeout = setTimeout(() => {
				this.stop.next();
				this.scrollStopTimeout = null;
				this.isScrolling = false;
			}, ScrollStopDebounceTime);
		};

		this.context.addEventListener(
			'scroll',
			this.scrollListener,
			supportsPassiveEvents ? { passive: true } : false
		);
	}

	resetScrollChange() {
		this.cachedScrollChange = null;
	}

	getScrollChange() {
		if (!this.cachedScrollChange) {
			this.cachedScrollChange = {
				top: Scroll.getScrollTop(this.context),
				left: Scroll.getScrollLeft(this.context),
				height: Scroll.getScrollWindowHeight(this.context),
				width: Scroll.getScrollWindowWidth(this.context),
				scrollHeight: Scroll.getScrollHeight(this.context),
				scrollWidth: Scroll.getScrollWidth(this.context),
			};
		}

		return this.cachedScrollChange;
	}
}
