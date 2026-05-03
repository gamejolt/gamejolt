import { onUnmounted, ref, shallowReadonly, toRef } from 'vue';

import { getElementOffset } from '~common/ruler/ruler-service';
import { defineIsolatedState } from '~common/ssr/isolated-state';
import { arrayRemove } from '~utils/array';
import { sleep } from '~utils/utils';

export type ScrollContext = HTMLElement | HTMLDocument;

export type AutoscrollAnchorState = {
	scrollTo: number | undefined;
	keyChanged: boolean;
};

interface ScrollToOptions {
	animate?: boolean;
	exact?: boolean;
	preventDirections?: ('up' | 'down')[];
}

type OnScrollCallback = (top: number) => void;

const _state = defineIsolatedState(() => ({
	shouldAutoScroll: true,
	autoscrollAnchor: undefined as AutoscrollAnchorState | undefined,
	offsetTop: 0,
	onScrollCallbacks: [] as OnScrollCallback[],
	isOnScrollBusy: false,
	lastOnScrollTop: null as number | null,
}));

/**
 * Sets the extra offset for scrolling. This can be used if there is a fixed
 * nav on the top that we need to always offset from.
 */
export function setScrollOffsetTop(offset: number) {
	_state().offsetTop = offset;
}

export function getScrollOffsetTop() {
	return _state().offsetTop;
}

export function getShouldAutoScroll() {
	return _state().shouldAutoScroll;
}

export function setShouldAutoScroll(value: boolean) {
	_state().shouldAutoScroll = value;
}

export function getAutoscrollAnchor() {
	return _state().autoscrollAnchor;
}

export function setAutoscrollAnchor(value: AutoscrollAnchorState | undefined) {
	_state().autoscrollAnchor = value;
}

export function getScrollTop(element?: ScrollContext): number {
	if (!element) {
		element = document;
	}

	if (element instanceof HTMLDocument) {
		return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
	}

	return element.scrollTop;
}

export function getScrollLeft(element?: ScrollContext): number {
	if (!element) {
		element = document;
	}

	if (element instanceof HTMLDocument) {
		return window.scrollX || document.documentElement.scrollLeft || document.body.scrollLeft;
	}

	return element.scrollLeft;
}

export function getScrollHeight(element?: ScrollContext): number {
	if (!element) {
		element = document;
	}

	if (element instanceof HTMLDocument) {
		return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
	}

	return element.scrollHeight;
}

export function getScrollWidth(element?: ScrollContext): number {
	if (!element) {
		element = document;
	}

	if (element instanceof HTMLDocument) {
		return Math.max(document.body.scrollWidth, document.documentElement.scrollWidth);
	}

	return element.scrollWidth;
}

export function getScrollWindowHeight(element?: ScrollContext): number {
	if (!element) {
		element = document;
	}

	return element === document ? window.innerHeight : (element as HTMLElement).clientHeight;
}

export function getScrollWindowWidth(element?: ScrollContext): number {
	if (!element) {
		element = document;
	}

	return element === document ? window.innerWidth : (element as HTMLElement).clientWidth;
}

/**
 * Returns the element's offset from the top of the scroll context.
 */
export function getElementOffsetTopFromContext(element: HTMLElement) {
	return getElementOffset(element).top - _state().offsetTop;
}

/**
 * Returns the element's offset from the bottom of the scroll context.
 */
export function getElementOffsetBottomFromContext(element: HTMLElement) {
	const { top, height } = getElementOffset(element);
	return top + height;
}

/**
 * Scrolls to the element passed in.
 */
export function scrollTo(input: string | number | HTMLElement, options: ScrollToOptions = {}) {
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
			_scrollToElement(element, _state().offsetTop, options);
		} else {
			_scrollTo(to, options);
		}
	}, 20);
}

function _scrollToElement(element: HTMLElement, offset: number, options: ScrollToOptions = {}) {
	const top = getScrollTop(document) + element.getBoundingClientRect().top - offset;
	_scrollTo(top, options);
}

function _scrollTo(to: number, options: ScrollToOptions = {}) {
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

/**
 * Minimum interval in milliseconds that {@link _onScroll} will assign to
 * {@link PageScrollSubscription.top} refs.
 */
export const PageScrollSubscriptionTimeout = 1_000 / 24;

export type PageScrollSubscription = ReturnType<typeof usePageScrollSubscription>;

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
		if (import.meta.env.SSR) {
			return;
		}

		if (isDisposed.value) {
			console.error(`Tried to activate a disposed subscription.`);
			return;
		}

		if (isEnabled.value) {
			return;
		}

		isEnabled.value = true;
		const state = _state();
		state.onScrollCallbacks.push(onScroll);
		if (state.lastOnScrollTop !== null) {
			onScroll(state.lastOnScrollTop);
		}
		_afterSubscriptionsChanged();
	}

	function disable() {
		if (import.meta.env.SSR) {
			return;
		}

		if (!isEnabled.value) {
			return;
		}

		arrayRemove(_state().onScrollCallbacks, i => i === onScroll);
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
	if (import.meta.env.SSR) {
		return;
	}

	const state = _state();
	if (state.onScrollCallbacks.length) {
		window.document.addEventListener('scroll', _onScroll, {
			passive: true,
		});

		// Need to call _onScroll lazily here, otherwise things may not be
		// loaded in yet. This can happen if you're on a page that holds the
		// only subscription, go to a new page, then go back through the
		// browser.
		sleep(0).then(() => _onScroll());
	} else {
		window.document.removeEventListener('scroll', _onScroll);
		state.lastOnScrollTop = null;
	}
}

async function _onScroll() {
	const state = _state();
	if (state.isOnScrollBusy) {
		return;
	}
	state.isOnScrollBusy = true;

	// Wait a bit so we don't do this too often.
	await sleep(PageScrollSubscriptionTimeout);

	let top = 0;
	if (state.onScrollCallbacks.length) {
		top = getScrollTop();
		for (const cb of state.onScrollCallbacks) {
			cb(top);
		}
	}
	state.lastOnScrollTop = top;
	state.isOnScrollBusy = false;
}
