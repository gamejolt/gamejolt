import { EventBus, EventBusDeregister } from './event-bus.service';

export type EventSubscription = {
	unsubscribe: EventBusDeregister;
};

// Doesn't matter what this value is, it just needs to be the same between next() and subscribe()
const TopicEventName = 'value';

export class EventTopic<T> {
	private e = new EventBus();

	subscribe(callback: (arg: T) => any): EventSubscription {
		const unsubFunc = this.e.on(TopicEventName, callback);
		return {
			unsubscribe: unsubFunc,
		};
	}

	next(value: T) {
		this.e.emit(TopicEventName, value);
	}
}
