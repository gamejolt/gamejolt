const localStorageKey = 'chat-notification-tabs';

export class NotificationHandler {
	channel: BroadcastChannel;
	isMain = false;
	isInitialized = false;

	private id = new Date().getTime();

	constructor() {
		this.channel = new BroadcastChannel('chat_notifications');
		this.channel.onmessage = this.handleBroadcast.bind(this);
		this.channel.postMessage({ type: 'ping', data: this.id });

		setTimeout(() => {
			// If we get no response from another tab assume this is the only tab open.
			if (!this.isInitialized) {
				this.isInitialized = true;
				this.isMain = true;
				window.localStorage.removeItem(localStorageKey);
				this.addTab(this.id);
			}
		}, 100);

		window.addEventListener('beforeunload', _event => {
			this.onClose();
		});
	}

	private addTab(id: number) {
		const tabs = window.localStorage.getItem(localStorageKey);
		const openedTabs = tabs ? JSON.parse(tabs) : [];

		if (openedTabs.indexOf(id) === -1) {
			openedTabs.push(id);
		}

		window.localStorage.setItem(localStorageKey, JSON.stringify(openedTabs));
	}

	private removeTab(id: number) {
		const tabs = window.localStorage.getItem(localStorageKey);
		const openedTabs = tabs ? JSON.parse(tabs) : [];
		const index = openedTabs.indexOf(id);

		if (index === -1) {
			return;
		}

		openedTabs.splice(index, 1);

		window.localStorage.setItem(localStorageKey, JSON.stringify(openedTabs));
	}

	private promote() {
		const tabs = window.localStorage.getItem(localStorageKey);
		const openedTabs = tabs ? JSON.parse(tabs) : [];

		if (openedTabs.length === 0) {
			return;
		}

		openedTabs.splice(0, 1);

		window.localStorage.setItem(localStorageKey, JSON.stringify(openedTabs));
		this.channel.postMessage({ type: 'promote', data: openedTabs[0] });
	}

	private handleBroadcast(msg: any) {
		const { data } = msg;

		if (data.type === 'ping') {
			if (!this.isMain && this.isInitialized) {
				return;
			}

			this.channel.postMessage({ type: 'pong' });
			this.addTab(data.data);
		} else if (data.type === 'pong') {
			if (this.isInitialized) {
				return;
			}

			this.isMain = false;
			this.isInitialized = true;
		} else if (data.type === 'promote') {
			if (data.data !== this.id) {
				return;
			}
			this.isMain = true;
		} else if (data.type === 'close') {
			if (!this.isMain) {
				return;
			}

			this.removeTab(data.data);
		}
	}

	onClose() {
		if (this.isMain) {
			this.promote();
		} else {
			this.channel.postMessage({ type: 'close', data: this.id });
		}
	}
}
