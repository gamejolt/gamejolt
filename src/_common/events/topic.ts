import { EventBus } from './event-bus.service';
import { EventSubscription } from './subscription';

export class EventTopic<T> {
	private e!: EventBus;

	constructor() {
		this.e = new EventBus();
	}

	subscribe(callback: (arg: T) => any) {
		return new EventSubscription(() => this.e.on('value', callback)).subscribe();
	}

	next(value: T) {
		this.e.emit('value', value);
	}
}
