import Axios from 'axios';

const TIMEOUT_INITIAL = 2000;
const TIMEOUT_GROW = 1.5;
const TIMEOUT_MAX = 30000;

export class ConnectionReconnect {
	private checkUrl: string;

	private failFn: Function;
	private successFn: Function;

	private timeoutMs = TIMEOUT_INITIAL;
	private timeoutHandle?: NodeJS.Timer;

	constructor(failFn: Function, successFn: Function) {
		// Just an image, so should be pretty lightweight.
		this.checkUrl = 'https://s.gamejolt.com/img/offline-connection-check.png';

		this.failFn = failFn;
		this.successFn = successFn;
		this.timeoutMs = TIMEOUT_INITIAL;

		this.check();
	}

	async check() {
		try {
			// Make sure we don't cache the call.
			await Axios.get(this.checkUrl + '?cb=' + Date.now());
			this.finish();
		} catch (e) {
			this.failFn();
			this.setTimeout();
		}
	}

	finish() {
		// If this was called when we're currently waiting on a timeout we need to clean it up.
		if (this.timeoutHandle) {
			clearTimeout(this.timeoutHandle);
			this.timeoutHandle = undefined;
		}

		this.successFn();
	}

	private setTimeout() {
		this.timeoutHandle = setTimeout(() => {
			// Before checking reset the timeout details.
			this.timeoutMs = Math.min(TIMEOUT_MAX, this.timeoutMs * TIMEOUT_GROW);
			this.timeoutHandle = undefined;

			// Now check to see if we're back online.
			this.check();
		}, this.timeoutMs);
	}
}
