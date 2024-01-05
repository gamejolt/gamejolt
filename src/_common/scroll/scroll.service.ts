import { onUnmounted, ref, shallowReadonly, toRef } from 'vue';
import { arrayRemove } from '../../utils/array';
import { Ruler } from '../ruler/ruler-service';
import { AppAutoscrollAnchor } from './auto-scroll/anchor';

export type ScrollContext = HTMLElement | HTMLDocument;

interface ScrollToOptions {
	animate?: boolean;
	exact?: boolean;
	preventDirections?: ('up' | 'down')[];
}

class ScrollService {
	shouldAutoScroll = true;
	autoscrollAnchor?: AppAutoscrollAnchor;
	offsetTop = 0;

	/**
	 * Sets the extra offset for scrolling. This can be used if there is a fixed
	 * nav on the top that we need to always offset from.
	 */
	setOffsetTop(offset: number) {
		this.offsetTop = offset;
	}

	getScrollTop(element?: ScrollContext): number {
		if (!element) {
			element = document;
		}

		if (element instanceof HTMLDocument) {
			return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
		}

		return element.scrollTop;
	}

	getScrollLeft(element?: ScrollContext): number {
		if (!element) {
			element = document;
		}

		if (element instanceof HTMLDocument) {
			return (
				window.scrollX || document.documentElement.scrollLeft || document.body.scrollLeft
			);
		}

		return element.scrollLeft;
	}

	getScrollHeight(element?: ScrollContext): number {
		if (!element) {
			element = document;
		}

		if (element instanceof HTMLDocument) {
			return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
		}

		return element.scrollHeight;
	}

	getScrollWidth(element?: ScrollContext): number {
		if (!element) {
			element = document;
		}

		if (element instanceof HTMLDocument) {
			return Math.max(document.body.scrollWidth, document.documentElement.scrollWidth);
		}

		return element.scrollWidth;
	}

	getScrollWindowHeight(element?: ScrollContext): number {
		if (!element) {
			element = document;
		}

		return element === document ? window.innerHeight : (element as HTMLElement).clientHeight;
	}

	getScrollWindowWidth(element?: ScrollContext): number {
		if (!element) {
			element = document;
		}

		return element === document ? window.innerWidth : (element as HTMLElement).clientWidth;
	}

	/**
	 * Returns the element's offset from the top of the scroll context.
	 */
	getElementOffsetTopFromContext(element: HTMLElement) {
		return Ruler.offset(element).top - this.offsetTop;
	}

	/**
	 * Returns the element's offset from the bottom of the scroll context.
	 */
	getElementOffsetBottomFromContext(element: HTMLElement) {
		const { top, height } = Ruler.offset(element);
		return top + height;
	}

	/**
	 * Scrolls to the element passed in.
	 */
	to(input: string | number | HTMLElement, options: ScrollToOptions = {}) {
		if (import.meta.env.SSR) {
			return;
		}

		let to = 0;
		let element: HTMLElement | null = null;

		if (options.animate === undefined) {
			options.animate = true;
		}

		if (typeof input === 'number') {
			to = input;
		} else if (typeof input === 'string') {
			element = document.getElementById(input);
			if (!element) {
				throw new Error(`Couldn't find element: ${input}`);
			}
		} else {
			element = input;
		}

		// Just make sure that all dom compilation is over.
		setTimeout(() => {
			if (element) {
				// We don't scroll the full way to down to the element. Do it
				// based on the screen's height, so that mobile and stuff works
				// well too. This is because I think it's kind of annoying when
				// the edge hits the exact top of the browser.
				this.scrollToElement(element, this.offsetTop, options);
			} else {
				this.scrollTo(to, options);
			}
		}, 20);
	}

	private scrollToElement(element: HTMLElement, offset: number, options: ScrollToOptions = {}) {
		const top = this.getScrollTop(document) + element.getBoundingClientRect().top - offset;
		this.scrollTo(top, options);
	}

	private scrollTo(to: number, options: ScrollToOptions = {}) {
		if (options.preventDirections) {
			const scrollY = window.scrollY;
			if (
				(options.preventDirections.includes('down') && to > scrollY) ||
				(options.preventDirections.includes('up') && to < scrollY)
			) {
				return;
			}
		}

		window.scrollTo({ top: to, behavior: options.animate ? 'smooth' : 'auto' });
	}
}

export const Scroll = /** @__PURE__ */ new ScrollService();

/**
 * Minimum interval in milliseconds that {@link _onScroll} will assign to
 * {@link PageScrollSubscription.top} refs.
 */
export const PageScrollSubscriptionTimeout = 1_000 / 30;

export type PageScrollSubscription = ReturnType<typeof usePageScrollSubscription>;
type OnScrollCallback = (top: number) => void;

const _onScrollCallbacks: OnScrollCallback[] = [];
let _isScrollLooping = false;
let _lastOnScrollTop: number | null = null;
let _lastScrollTime = 0;

/** Should only be used in a setup block. */
export function usePageScrollSubscription(
	onScroll: OnScrollCallback,
	options: {
		/**
		 * Determines if the subscription should be active immediately.
		 */
		enable?: boolean;
	} = {}
) {
	const isEnabled = ref(false);
	const isDisposed = ref(false);

	function enable() {
		if (isDisposed.value) {
			console.error(`Tried to activate a disposed subscription.`);
			return;
		}

		if (isEnabled.value) {
			return;
		}

		isEnabled.value = true;
		_onScrollCallbacks.push(onScroll);
		if (_lastOnScrollTop !== null) {
			onScroll(_lastOnScrollTop);
		}
		_afterSubscriptionsChanged();
	}

	function disable() {
		if (!isEnabled.value) {
			return;
		}

		arrayRemove(_onScrollCallbacks, i => i === onScroll);
		isEnabled.value = false;
		if (!isDisposed.value) {
			onScroll(0);
		}
		_afterSubscriptionsChanged();
	}

	onUnmounted(() => {
		isDisposed.value = true;
		disable();
	});

	if (options.enable) {
		enable();
	}

	return shallowReadonly({
		enable,
		disable,
		isActive: toRef(() => isEnabled.value && !isDisposed.value),
	});
}

function _afterSubscriptionsChanged() {
	// If we don't have any scroll callbacks, the scroll loop will stop itself.
	// We don't need to do anything here.
	if (!_onScrollCallbacks.length) {
		return;
	}

	if (_isScrollLooping) {
		return;
	}

	// Start us next animation frame so that the page is finished mounting.
	_isScrollLooping = true;
	window.requestAnimationFrame(_scrollLoop);
}

function _scrollLoop() {
	if (!_onScrollCallbacks.length) {
		// Don't register another animation frame. Just reset ourselves.
		_lastOnScrollTop = null;
		_isScrollLooping = false;
		return;
	}

	const startTime = Date.now();
	if (startTime - _lastScrollTime >= PageScrollSubscriptionTimeout) {
		const top = Scroll.getScrollTop();
		if (top !== _lastOnScrollTop) {
			for (const cb of _onScrollCallbacks) {
				cb(top);
			}
			_lastOnScrollTop = top;
		}
		_lastScrollTime = startTime;
	}

	// Continue looping.
	window.requestAnimationFrame(_scrollLoop);
}
