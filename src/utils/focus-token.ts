import { onBeforeUnmount, onMounted } from 'vue';
import { arrayRemove } from './array';

type FocusCallback = () => void;

interface FocusSubscriber {
	focus?: FocusCallback;
	blur?: FocusCallback;
}

export type FocusToken = ReturnType<typeof createFocusToken>;

/**
 * Allows you to pass this token into children to focus them from parent
 * components.
 */
export function createFocusToken() {
	const subscribers: FocusSubscriber[] = [];

	function focus() {
		subscribers.forEach(i => i.focus?.());
	}

	function blur() {
		subscribers.forEach(i => i.blur?.());
	}

	/**
	 * Should be called within component setup() function to register the
	 * required hooks for using this focus watcher and disposing when no longer
	 * in scope.
	 */
	function register(subscriber: FocusSubscriber) {
		onMounted(() => {
			subscribers.push(subscriber);
		});

		onBeforeUnmount(() => {
			arrayRemove(subscribers, i => i === subscriber);
		});
	}

	return {
		focus,
		blur,
		register,
	};
}
