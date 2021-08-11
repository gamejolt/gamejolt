import Vue from 'vue';

export type EventBusDeregister = () => void;

// TODO(vue3): rewrite to not use vue stuff
export class EventBus {
	private static global = new EventBus();

	private e = new Vue();

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
