import { Route } from 'vue-router';
import { Scroll } from '../scroll.service';

/**
 * Returns the scroll position but also sets up a timeout to enforce the scroll
 * position. Browsers for some reason scroll randomly through the vue-router
 * scroll behavior. It's always slightly off. Scrolling again in the browser's
 * next tick seems to solve this in most cases.
 */
function scroll(pos: { x: number; y: number }) {
	setTimeout(() => {
		window.scrollTo(pos.x, pos.y);
	}, 0);
	return pos;
}

export function initScrollBehavior() {
	// Should tell the browser that we want to handle our own scrolling.
	if (!GJ_IS_SSR) {
		if ('scrollRestoration' in history) {
			history.scrollRestoration = 'manual';
		}
	}

	return function scrollBehavior(
		to: Route,
		_from: Route,
		savedPosition?: { x: number; y: number }
	) {
		// We always want to clear the keyChanged attribute for anchors every
		// autoscroll event.
		const anchor = Scroll.autoscrollAnchor;
		let didAnchorChange = false;
		if (anchor) {
			didAnchorChange = anchor.keyChanged;
			anchor.keyChanged = false;
		}

		// Skip one auto scroll trigger.
		if (!Scroll.shouldAutoScroll) {
			Scroll.shouldAutoScroll = true;
			return undefined;
		}

		if (savedPosition) {
			return scroll(savedPosition);
		}

		// If the anchor key hasn't changed then we can do the anchor scrolling.
		// If it has changed, it means that we should do the normal scroll
		// behavior since the content on the page is going to be different.
		if (anchor && !didAnchorChange) {
			if (typeof anchor.scrollTo !== 'undefined') {
				return scroll({
					x: 0,
					y: anchor.scrollTo,
				});
			} else {
				return undefined;
			}
		}

		if (to.hash) {
			return {
				selector: to.hash,
			};
		}

		return {
			x: 0,
			y: 0,
		};
	};
}
