import { MaybeRef, onBeforeUnmount, unref, watch } from 'vue';

export function useResizeObserver({
	target,
	callback,
}: {
	target: MaybeRef<HTMLElement | undefined>;
	callback: ResizeObserverCallback;
}) {
	let observer: ResizeObserver | undefined;

	const stopWatch = watch(
		() => unref(target),
		el => {
			cleanup();

			if (el) {
				observer = new ResizeObserver(callback);
				observer.observe(el);
			}
		},
		{ immediate: true, flush: 'post' }
	);

	function cleanup() {
		if (observer) {
			observer.disconnect();
			observer = undefined;
		}
	}

	onBeforeUnmount(() => {
		cleanup();
		stopWatch();
	});

	return {
		observer,
	};
}
