import { ConnectionReconnect } from './reconnect-service';
import { AppStore } from '../../vue/services/app/app-store';
import { VuexStore } from '../../utils/vuex';
import { makeObservableService } from '../../utils/vue';

export class Connection {
	private static isDeviceOffline = false;
	private static hasRequestFailure = false;
	private static reconnectChecker?: ConnectionReconnect;

	static get isOffline() {
		return this.isDeviceOffline || this.hasRequestFailure;
	}

	static get isClientOffline() {
		return GJ_IS_CLIENT && this.isOffline;
	}

	static init(store: VuexStore) {
		if (GJ_IS_SSR) {
			return;
		}

		// This attribute isn't perfect. The browser will set this when they are
		// absolutely disconnected to the internet through their network card,
		// but it won't catch things like their router saying they're connected
		// even though it has no connection. We have to do our own request
		// checking for that.
		this.isDeviceOffline = !window.navigator.onLine;

		// The error state gets set on the store globally.
		store.watch(
			state => (state.app as AppStore).error,
			error => {
				this.setRequestFailure(error === 'offline');
			}
		);

		// We hook into browser events to know right away if they lost
		// connection to their router.
		document.addEventListener('online', () => {
			this.isDeviceOffline = false;

			// While connection was offline, we may have tried making a request
			// that failed. Let's recheck for connectivity right away if that is
			// the case.
			if (this.reconnectChecker) {
				this.reconnectChecker.check();
			}
		});

		document.addEventListener('offline', () => {
			this.isDeviceOffline = true;
		});
	}

	/**
	 * Can be used to tell us that a request has failed due to a connection
	 * error or when a request has went through successfully so we can reset.
	 */
	private static setRequestFailure(failed: boolean) {
		// If we went into request failure mode let's start checking for a
		// reconnection.
		if (failed) {
			this.setupReconnectChecker();
		}
	}

	private static setupReconnectChecker() {
		// We don't want to set that we have a request failure until we do a
		// first check that fails. When we come back online, we just want to set
		// that we no longer have a request failure.
		this.reconnectChecker = new ConnectionReconnect(
			() => {
				this.hasRequestFailure = true;
			},
			() => {
				this.reconnectChecker = undefined;
				this.hasRequestFailure = false;
			}
		);
	}
}

makeObservableService(Connection);
