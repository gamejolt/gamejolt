export class CancelToken {
	private canceled = false;
	private cancelPromise!: Promise<void>;
	private cancelPromiseResolver!: () => void;

	constructor() {
		this.cancelPromise = new Promise(resolver => (this.cancelPromiseResolver = resolver));
	}

	get isCanceled() {
		return this.canceled;
	}

	cancel() {
		if (this.canceled) {
			return;
		}

		this.canceled = true;
		this.cancelPromiseResolver();
	}

	untilCanceled() {
		return this.cancelPromise;
	}
}
