export type UnsubscribeFunc = () => void;

export class EventSubscription {
	private unsubFunc: UnsubscribeFunc | null;

	constructor(private subscriber: () => UnsubscribeFunc) {
		this.unsubFunc = null;
	}

	subscribe() {
		if (!this.unsubFunc) {
			this.unsubFunc = this.subscriber();
		}

		return this;
	}

	unsubscribe() {
		if (this.unsubFunc) {
			this.unsubFunc();
			this.unsubFunc = null;
		}

		return this;
	}
}
