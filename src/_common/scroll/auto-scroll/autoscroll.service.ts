import { nextTick } from 'vue';
import { RouterScrollBehavior } from 'vue-router';

import {
	getAutoscrollAnchor,
	getShouldAutoScroll,
	setShouldAutoScroll,
} from '~common/scroll/scroll.service';

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
		const anchor = getAutoscrollAnchor();
		let didAnchorChange = false;
		if (anchor) {
			didAnchorChange = anchor.keyChanged;
			anchor.keyChanged = false;
		}

		// Skip one auto scroll trigger.
		if (!getShouldAutoScroll()) {
			setShouldAutoScroll(true);
			return;
		}

		if (savedPosition) {
			return _scroll(savedPosition, { waitForLayout: true });
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
 * Maximum time to wait for the page to lay out enough content to satisfy the
 * scroll target before giving up and scrolling anyway.
 */
const ScrollWaitForLayoutTimeoutMs = 500;

async function _scroll(
	pos: { left: number; top: number },
	options: { waitForLayout?: boolean } = {}
) {
	await nextTick();

	if (options.waitForLayout) {
		// vue-router fires scrollBehavior after one nextTick, but the new
		// route's DOM may not have laid out enough content for the target
		// position yet (cached feed views render their items across multiple
		// frames). `window.scrollTo` would clamp to the current scrollHeight
		// and land us at the top. Poll layout until it's tall enough.
		await _waitForScrollHeight(pos.top + window.innerHeight);
	}

	window.scrollTo(pos);
	return pos;
}

function _waitForScrollHeight(requiredHeight: number) {
	return new Promise<void>(resolve => {
		const start = performance.now();
		function check() {
			if (
				document.documentElement.scrollHeight >= requiredHeight ||
				performance.now() - start >= ScrollWaitForLayoutTimeoutMs
			) {
				resolve();
				return;
			}
			requestAnimationFrame(check);
		}
		requestAnimationFrame(check);
	});
}
