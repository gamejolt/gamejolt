import Vue from 'vue';

export type EventBusDeregister = () => void;

export class EventBus {
	private e!: Vue;

	private static global = new EventBus();

	constructor() {
		this.e = new Vue();
	}

	emit(event: string, ...args: any[]) {
		this.e.$emit(event, ...args);
	}

	on(event: string, callback: Function): EventBusDeregister {
		this.e.$on(event, callback);

		return () => {
			this.e.$off(event, callback);
		};
	}

	static emit(event: string, ...args: any[]) {
		this.global.emit(event, ...args);
	}

	static on(event: string, callback: Function): EventBusDeregister {
		return this.global.on(event, callback);
	}
}
