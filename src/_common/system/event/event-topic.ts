import { arrayRemove } from '../../../utils/array';

type EventListener<T> = (arg: T) => void;
type EventBusDeregister = () => void;

export type EventSubscription = {
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
