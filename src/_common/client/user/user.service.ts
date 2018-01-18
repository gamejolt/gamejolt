import { VuexStore } from '../../../lib/gj-lib-client/utils/vuex';
import { User } from '../../../lib/gj-lib-client/components/user/user.model';
import { Environment } from '../../../lib/gj-lib-client/components/environment/environment.service';
import { AppStore } from '../../../lib/gj-lib-client/vue/services/app/app-store';

// So that this can be pulled into any section and not rely on the main "app" store, we manually
// attach this so we know it exists.
type Store_ = VuexStore<{ app: AppStore }>;

export class ClientUser {
	static init(store: Store_) {
		// We bootstrap the client with the previously stored user if there was any.
		// This way they can access client offline with their previous user.
		const localUser = localStorage.getItem('user');
		if (localUser) {
			const user = new User(JSON.parse(localUser));
			store.commit('app/setUser', user);
		} else if (store.state.app.clientSection !== 'auth') {
			// Must be logged in to use client.
			this.authRedirect();
		}

		// When the app user changes in the store, freeze it into local storage so we can bootstrap
		// from that next client launch (before any payload response).
		store.watch(
			state => state.app.user,
			user => {
				if (user) {
					localStorage.setItem('user', JSON.stringify(user));
				} else {
					localStorage.removeItem('user');

					// If they're logged out in client, we have to force to auth page..
					this.authRedirect();
				}
			}
		);
	}

	private static authRedirect() {
		window.location.href = Environment.authBaseUrl + '/login';
	}
}
