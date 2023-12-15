import { Ref, onScopeDispose, ref } from 'vue';
import { arrayRemove } from '../../utils/array';
import { sleep } from '../../utils/utils';
import { Ruler } from '../ruler/ruler-service';
import { AppAutoscrollAnchor } from './auto-scroll/anchor';

export type ScrollContext = HTMLElement | HTMLDocument;

interface ScrollToOptions {
	animate?: boolean;
	exact?: boolean;
	preventDirections?: ('up' | 'down')[];
}

export interface PageScrollSubscription {
	id: number;
	top: Ref<number>;
	_forAnimation: boolean;
	_disposed: boolean;
	unsubscribe: () => void;
}

class ScrollService {
	/**
	 * Minimum interval in milliseconds that {@link _onScroll} will assign to
	 * {@link PageScrollSubscription.top} refs.
	 */
	readonly onScrollTimeout = 1_000 / 24;

	shouldAutoScroll = true;
	autoscrollAnchor?: AppAutoscrollAnchor;
	offsetTop = 0;

	_subscriptionId = 0;
	_subscriptions: PageScrollSubscription[] = [];
	_isOnScrollBusy = false;

	/** Should only be used in a setup block */
	getPageScrollSubscription(
		options: {
			/**
			 * Determines if a new animation frame should be requested before
			 * assigning to {@link top}.
			 */
			forAnimation?: boolean;
		} = {}
	) {
		const id = ++this._subscriptionId;
		const top = ref(0);
		const { forAnimation = false } = options;
		const subscription: PageScrollSubscription = {
			id,
			top,
			_forAnimation: forAnimation,
			_disposed: false,
			unsubscribe: () => {
				arrayRemove(this._subscriptions, i => i.id === id);
				subscription._disposed = true;
				top.value = 0;
				this._afterSubscriptionsChanged();
			},
		};

		// TODO(profile-scrunch) Not sure if this or onUnmounted is preferred.
		onScopeDispose(() => {
			subscription.unsubscribe();
		});

		this._subscriptions.push(subscription);
		this._afterSubscriptionsChanged();
		return subscription;
	}

	_afterSubscriptionsChanged() {
		if (this._subscriptions.length && this._subscriptions.some(i => !i._disposed)) {
			window.document.addEventListener('scroll', this._onScroll.bind(this), {
				passive: true,
			});

			// Need to call _onScroll lazily here, otherwise things may not be
			// loaded in yet. This can happen if you're on a page that holds the
			// only subscription, go to a new page, then go back through the
			// browser.
			sleep(0).then(() => this._onScroll());
		} else {
			window.document.removeEventListener('scroll', this._onScroll.bind(this));
		}
	}

	async _onScroll() {
		if (this._isOnScrollBusy) {
			return;
		}
		this._isOnScrollBusy = true;

		// Wait a bit so we don't do this too often.
		await sleep(this.onScrollTimeout);

		if (!this._subscriptions.length || this._subscriptions.every(i => i._disposed)) {
			this._isOnScrollBusy = false;
			return;
		}

		const top = this.getScrollTop();

		for (const subscription of this._subscriptions) {
			// Non-animator subscriptions can be set immediately.
			if (!subscription._forAnimation && !subscription._disposed) {
				subscription.top.value = top;
			}
		}

		// Queue up an animation frame if any of our subscriptions are used for
		// some animation.
		//
		// TODO(profile-scrunch) This seemed to perform better when animation
		// background position on many items. Should probably test some more to
		// see if it's actually an improvement.
		if (this._subscriptions.some(i => i._forAnimation)) {
			window.requestAnimationFrame(() => {
				for (const subscription of this._subscriptions) {
					if (subscription._forAnimation && !subscription._disposed) {
						subscription.top.value = top;
					}
				}
			});
		}

		// TODO(profile-scrunch) Should probably unset this within the animation
		// frame if we request one.
		this._isOnScrollBusy = false;
	}

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
