import { Api } from '../api/api.service';
const TIMEOUT_INITIAL = 2000;
const TIMEOUT_GROW = 1.5;
const TIMEOUT_MAX = 30000;

export class ConnectionReconnect {
	// Just an image, so should be pretty lightweight.
	private checkUrl = 'https://s.gjcdn.net/img/offline-connection-check.png';

	private timeoutMs = TIMEOUT_INITIAL;
	private timeoutHandle?: NodeJS.Timer;

	constructor(private failFn: () => void, private successFn: () => void) {}

	async check() {
		try {
			// Make sure we don't cache the call.
			await Api.sendRawRequest(this.checkUrl + '?cb=' + Date.now());
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
