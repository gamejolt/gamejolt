import { onMounted, onUnmounted } from 'vue';
import { arrayRemove } from '../../../utils/array';

type EventListener<T> = (arg: T) => void;
type EventBusDeregister = () => void;

export type EventSubscription = {
	/**
	 * Will close the subscription. No more events will come after calling this.
	 */
	close: EventBusDeregister;
};

export class EventTopic<T> {
	private listeners: EventListener<T>[] = [];

	subscribe(listener: EventListener<T>): EventSubscription {
		this.listeners.push(listener);

		return {
			close: () => {
				arrayRemove(this.listeners, i => i === listener);
			},
		};
	}

	next(value: T) {
		this.listeners.forEach(i => i(value));
	}
}

export function useEventSubscription<T>(topic: EventTopic<T>, listener: EventListener<T>) {
	let _subscription: EventSubscription | undefined;

	function close() {
		_subscription?.close();
		_subscription = undefined;
	}

	onMounted(() => {
		_subscription = topic.subscribe(listener);
	});

	onUnmounted(() => {
		close();
	});

	return { close };
}
