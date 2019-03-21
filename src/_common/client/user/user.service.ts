import { Environment } from 'game-jolt-frontend-lib/components/environment/environment.service';
import { Navigate } from 'game-jolt-frontend-lib/components/navigate/navigate.service';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import { VuexStore } from 'game-jolt-frontend-lib/utils/vuex';
import { AppStore } from 'game-jolt-frontend-lib/vue/services/app/app-store';

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
		// TODO: This is a hack to fix redirect loop between the client sections and the auth section.
		// Since redirecting with window.location.href isnt really synchronous theres a race condition
		// between the time user service figures out it has no user and redirects to auth
		// and the init logic in client service to redirect to downgrade section.
		//
		// This hack will not hold if we have other sections under the 'client' section that need to redirect to auth if not logged in.
		const fromSection = Navigate.currentSection;
		if (!Navigate.isRedirecting && (!fromSection || fromSection !== 'client')) {
			Navigate.goto(Environment.authBaseUrl + '/login');
		}
	}
}
