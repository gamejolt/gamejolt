import { MaybeRefOrGetter, onBeforeUnmount, toValue, watchPostEffect } from 'vue';

export function useResizeObserver({
	target,
	callback,
}: {
	target: MaybeRefOrGetter<HTMLElement | undefined | null>;
	callback: ResizeObserverCallback;
}) {
	let observer: ResizeObserver | undefined;

	const stopWatch = watchPostEffect(() => {
		cleanup();
		const el = toValue(target);

		if (el) {
			observer = new ResizeObserver(callback);
			observer.observe(el);
		}
	});

	function cleanup() {
		if (observer) {
			observer.disconnect();
			observer = undefined;
		}
	}

	onBeforeUnmount(() => {
		stopWatch();
		cleanup();
	});

	return {
		observer,
	};
}
