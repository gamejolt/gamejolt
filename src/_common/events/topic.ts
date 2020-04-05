import { EventBus } from './event-bus.service';
import { Subscription } from './subscription';

export class Topic<T> {
	private e!: EventBus;

	constructor() {
		this.e = new EventBus();
	}

	subscribe(callback: (arg: T) => any) {
		return new Subscription(() => this.e.on('value', callback)).subscribe();
	}

	next(value: T) {
		this.e.emit('value', value);
	}
}
