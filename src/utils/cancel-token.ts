export class CancelToken {
	_canceled = false;
	_cancelPromise!: Promise<void>;
	_cancelPromiseResolver!: () => void;

	constructor() {
		this._cancelPromise = new Promise(resolver => (this._cancelPromiseResolver = resolver));
	}

	get isCanceled() {
		return this._canceled;
	}

	cancel() {
		if (this._canceled) {
			return;
		}

		this._canceled = true;
		this._cancelPromiseResolver();
	}

	untilCanceled() {
		return this._cancelPromise;
	}

	/**
	 * Will throw if this token is canceled.
	 */
	assert() {
		if (this.isCanceled) {
			throw new Error('Cancel token is canceled.');
		}
	}
}
