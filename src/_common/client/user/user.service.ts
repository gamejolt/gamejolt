import { VuexStore } from '../../../lib/gj-lib-client/utils/vuex';
import { User } from '../../../lib/gj-lib-client/components/user/user.model';
import { Environment } from '../../../lib/gj-lib-client/components/environment/environment.service';
import { AppStore } from '../../../lib/gj-lib-client/vue/services/app/app-store';
import { Navigate } from '../../../lib/gj-lib-client/components/navigate/navigate.service';

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
		} else if (Navigate.currentSection !== 'auth') {
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
		// TODO: This is a hack to fix redirect loop between the client downgrade section and the auth section.
		// Apparantly nwjs doesnt clean up the store properly when redirected using window.location.href like the browser does,
		// so theres a race condition between the time user service figures out it has no user and redirects to auth
		// and the init logic in client service to redirect to downgrade section.
		//
		// This hack will not hold if we have other sections under the 'client' section.
		const fromSection = Navigate.currentSection;
		if (!fromSection || fromSection !== 'client') {
			Navigate.goto(Environment.authBaseUrl + '/login');
		}
	}
}
