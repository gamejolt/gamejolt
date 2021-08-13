import { reactive } from 'vue';
import { WithAppStore } from '../store/app-store';
import { ConnectionReconnect } from './reconnect-service';

class ConnectionService {
	isDeviceOffline = false;
	hasRequestFailure = false;
	reconnectChecker?: ConnectionReconnect;

	get isOffline() {
		return this.isDeviceOffline || this.hasRequestFailure;
	}

	get isClientOffline() {
		return GJ_IS_CLIENT && this.isOffline;
	}
}

export const Connection = reactive(new ConnectionService()) as ConnectionService;

export function initConnectionService(store: WithAppStore) {
	if (GJ_IS_SSR) {
		return;
	}

	// This attribute isn't perfect. The browser will set this when they are
	// absolutely disconnected to the internet through their network card,
	// but it won't catch things like their router saying they're connected
	// even though it has no connection. We have to do our own request
	// checking for that.
	Connection.isDeviceOffline = !window.navigator.onLine;

	// The error state gets set on the store globally.
	store.watch(
		state => state.app.error,
		error => {
			_setRequestFailure(error === 'offline');
		}
	);

	// We hook into browser events to know right away if they lost
	// connection to their router.
	document.addEventListener('online', () => {
		Connection.isDeviceOffline = false;

		// While connection was offline, we may have tried making a request
		// that failed. Let's recheck for connectivity right away if that is
		// the case.
		if (Connection.reconnectChecker) {
			Connection.reconnectChecker.check();
		}
	});

	document.addEventListener('offline', () => {
		Connection.isDeviceOffline = true;
	});
}

/**
 * Can be used to tell us that a request has failed due to a connection
 * error or when a request has went through successfully so we can reset.
 */
function _setRequestFailure(failed: boolean) {
	// If we went into request failure mode let's start checking for a
	// reconnection.
	if (failed) {
		_setupReconnectChecker();
	}
}

function _setupReconnectChecker() {
	// We don't want to set that we have a request failure until we do a
	// first check that fails. When we come back online, we just want to set
	// that we no longer have a request failure.
	Connection.reconnectChecker = new ConnectionReconnect(
		() => {
			Connection.hasRequestFailure = true;
		},
		() => {
			Connection.reconnectChecker = undefined;
			Connection.hasRequestFailure = false;
		}
	);
}
