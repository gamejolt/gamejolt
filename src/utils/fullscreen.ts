import { computed, ref, watch } from 'vue';
import { Screen } from '../_common/screen/screen-service';

/**
 * Returns a CSS representation of the full screen's height. Useful for
 * stretching a container to be fullscreen.
 */
export function useFullscreenHeight() {
	const height = ref(0);

	watch(
		() => Screen.height,
		(screenHeight: number) => {
			// The mobile address bar takes up space and when they scroll,
			// it's pretty jarring to have the whole screen shift around.
			// This only allows any screen shifts if the content area
			// changed more than 100px.
			if (Math.abs(screenHeight - height.value) > 100) {
				height.value = screenHeight;
			}
		},
		{ immediate: true }
	);

	return computed(() => `calc(${height.value}px - var(--shell-top))`);
}
