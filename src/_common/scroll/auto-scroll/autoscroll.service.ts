import { nextTick } from 'vue';
import { RouterScrollBehavior } from 'vue-router';
import { Scroll } from '../scroll.service';

export function initScrollBehavior(): RouterScrollBehavior {
	// Should tell the browser that we want to handle our own scrolling.
	if (!import.meta.env.SSR) {
		if ('scrollRestoration' in history) {
			history.scrollRestoration = 'manual';
		}
	}

	return (to, _from, savedPosition) => {
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
			return;
		}

		if (savedPosition) {
			return _scroll(savedPosition);
		}

		// If the anchor key hasn't changed then we can do the anchor scrolling.
		// If it has changed, it means that we should do the normal scroll
		// behavior since the content on the page is going to be different.
		if (anchor && !didAnchorChange) {
			if (typeof anchor.scrollTo !== 'undefined') {
				return _scroll({
					left: 0,
					top: anchor.scrollTo,
				});
			} else {
				return;
			}
		}

		if (to.hash) {
			return {
				el: to.hash,
			};
		}

		return {
			left: 0,
			top: 0,
		};
	};
}

/**
 * Returns the scroll position but also sets up a timeout to enforce the scroll
 * position. Browsers for some reason scroll randomly through the vue-router
 * scroll behavior. It's always slightly off. Scrolling again in the browser's
 * next tick seems to solve this in most cases.
 */
async function _scroll(pos: { left: number; top: number }) {
	await nextTick();
	window.scrollTo(pos);
	return pos;
}
