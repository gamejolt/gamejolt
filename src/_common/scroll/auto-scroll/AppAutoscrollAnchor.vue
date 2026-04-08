<script lang="ts" setup>
import { onMounted, onUnmounted, useTemplateRef, watch } from 'vue';
import { useRouter } from 'vue-router';

import { Ruler } from '../../ruler/ruler-service';
import { AutoscrollAnchorState, Scroll } from '../scroll.service';

type Props = {
	disabled?: boolean;
	/**
	 * Scroll anchor can stay on the page while the page content technically
	 * changes. For example, when switching between game pages the anchor
	 * component will be same, but we technically want to treat it like a new
	 * anchor. This checks to see if a particular prop changes, and if so it
	 * treats it like a new scroll anchor.
	 */
	anchorKey?: any;
};
const { disabled, anchorKey } = defineProps<Props>();

const rootEl = useTemplateRef<HTMLDivElement>('root');
const router = useRouter();

/**
 * Plain object stored in Scroll.autoscrollAnchor so the autoscroll service
 * can read/write state without needing Vue reactivity.
 */
const anchorState: AutoscrollAnchorState = {
	/**
	 * We can't get the scroll top during the actual scroll behavior because
	 * DOM elements may no longer be in view which could affect scroll pos. We
	 * record the current scroll here before the route change so it's correct.
	 */
	scrollTo: 0,
	keyChanged: false,
};

let beforeRouteDeregister: (() => void) | undefined;

watch(
	() => anchorKey,
	() => {
		anchorState.keyChanged = true;
	}
);

onMounted(() => {
	Scroll.autoscrollAnchor = anchorState;

	beforeRouteDeregister = router.beforeEach((_to, _from, next) => {
		if (disabled) {
			anchorState.scrollTo = 0;
		} else {
			const recordedScroll = Scroll.getScrollTop();

			// We only scroll to the anchor if they're scrolled past it currently.
			const offset = Ruler.offset(rootEl.value!);
			if (recordedScroll > offset.top - Scroll.offsetTop) {
				// Scroll to the anchor.
				anchorState.scrollTo = offset.top - Scroll.offsetTop;
			} else {
				// Don't scroll since they're above the anchor.
				anchorState.scrollTo = undefined;
			}
		}

		next();
	});
});

onUnmounted(() => {
	Scroll.autoscrollAnchor = undefined;

	if (beforeRouteDeregister) {
		beforeRouteDeregister();
		beforeRouteDeregister = undefined;
	}
});
</script>

<template>
	<div ref="root">
		<slot />
	</div>
</template>
