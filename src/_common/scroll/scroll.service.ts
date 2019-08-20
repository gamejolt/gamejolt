import { Ruler } from '../ruler/ruler-service';
import { Screen } from '../screen/screen-service';
import { AppAutoscrollAnchor } from './auto-scroll/anchor';
import { ScrollWatcher } from './watcher.service';

// Polyfill smooth scrolling.
if (!GJ_IS_SSR) {
	require('smoothscroll-polyfill').polyfill();
}

export type ScrollContext = HTMLElement | HTMLDocument;

export class Scroll {
	static shouldAutoScroll = true;
	static autoscrollAnchor?: AppAutoscrollAnchor;

	// For SSR context we have to set this to undefined. No methods should be
	// called that would use the context.
	static watcher: ScrollWatcher;
	static offsetTop = 0;

	/**
	 * Sets the extra offset for scrolling. This can be used if there is a fixed
	 * nav on the top that we need to always offset from.
	 */
	static setOffsetTop(offset: number) {
		this.offsetTop = offset;
	}

	/**
	 * Sets the element that we will scroll when any scroll commands are issued.
	 */
	static init() {
		this.watcher = new ScrollWatcher(document);

		// Set up events to let the Screen service know if we're scrolling or not.
		this.watcher.start.subscribe(() => (Screen.isScrolling = true));
		this.watcher.stop.subscribe(() => (Screen.isScrolling = false));
	}

	static getScrollTop(element?: ScrollContext): number {
		if (!element) {
			element = document;
		}

		if (element instanceof HTMLDocument) {
			return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
		}

		return element.scrollTop;
	}

	static getScrollLeft(element?: ScrollContext): number {
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

	static getScrollHeight(element?: ScrollContext): number {
		if (!element) {
			element = document;
		}

		if (element instanceof HTMLDocument) {
			return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
		}

		return element.scrollHeight;
	}

	static getScrollWidth(element?: ScrollContext): number {
		if (!element) {
			element = document;
		}

		if (element instanceof HTMLDocument) {
			return Math.max(document.body.scrollWidth, document.documentElement.scrollWidth);
		}

		return element.scrollWidth;
	}

	static getScrollWindowHeight(element?: ScrollContext): number {
		if (!element) {
			element = document;
		}

		return element === document ? window.innerHeight : (element as HTMLElement).clientHeight;
	}

	static getScrollWindowWidth(element?: ScrollContext): number {
		if (!element) {
			element = document;
		}

		return element === document ? window.innerWidth : (element as HTMLElement).clientWidth;
	}

	/**
	 * Returns the element's offset from the top of the scroll context.
	 */
	static getElementOffsetTopFromContext(element: HTMLElement) {
		return Ruler.offset(element).top - this.offsetTop;
	}

	/**
	 * Returns the element's offset from the bottom of the scroll context.
	 */
	static getElementOffsetBottomFromContext(element: HTMLElement) {
		const { top, height } = Ruler.offset(element);
		return top + height;
	}

	/**
	 * Scrolls to the element passed in.
	 */
	static to(input: string | number | HTMLElement, options: { animate?: boolean } = {}) {
		if (GJ_IS_SSR) {
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
				this.scrollToElement(element, Screen.height * 0.1 + this.offsetTop, options);
			} else {
				this.scrollTo(to, options);
			}
		}, 20);
	}

	private static scrollToElement(
		element: HTMLElement,
		offset: number,
		options: { animate?: boolean } = {}
	) {
		let top = this.getScrollTop(document) + element.getBoundingClientRect().top - offset;
		this.scrollTo(top, options);
	}

	private static scrollTo(to: number, options: { animate?: boolean } = {}) {
		window.scrollTo({ top: to, behavior: options.animate ? 'smooth' : 'auto' });
	}
}

if (!GJ_IS_SSR) {
	// Sets the document as the scroll context.
	Scroll.init();
}
