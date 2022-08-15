import { unref, watch } from 'vue';
import { Environment } from '../../environment/environment.service';
import { Navigate } from '../../navigate/navigate.service';
import type { CommonStore } from '../../store/common-store';

export class ClientUser {
	static init({ commonStore: { user, setUser } }: { commonStore: CommonStore }) {
		// We bootstrap the client with the previously stored user if there was any.
		// This way they can access client offline with their previous user.
		const localUser = localStorage.getItem('user');
		if (localUser) {
			setUser(JSON.parse(localUser));
		} else if (Navigate.currentClientSection !== 'auth') {
			// Must be logged in to use client.
			this.authRedirect();

			// Api.sendRequest('/web/touch', null, { detach: true, processPayload: false }).then(
			// 	response => {
			// 		if (!response || !response.data || !response.data.user) {
			// 			this.authRedirect();
			// 		}
			// 	}
			// );
		}

		// When the app user changes in the store, freeze it into local storage
		// so we can bootstrap from that next client launch (before any payload
		// response).
		watch(
			() => unref(user),
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
		if (GJ_BUILD_TYPE === 'serve-hmr') {
			console.log('aborting auth redirect');
			return;
		}

		console.log('redirecting to auth');

		// TODO: This hacks prevents redirecting to auth section from the client sections.
		// If we're on the client upgrade route, we do not want to be redirected away to auth even if we are not logged in.
		// Without this hack in place theres a redirect loop between the client sections and the auth section.
		// Since redirecting with window.location.href isnt really synchronous theres a race condition
		// between the time user service figures out it has no user (which would cause it to redirect to auth)
		// and the init logic in client service to redirect to the client upgrade section.
		//
		// Note: This hack assumes there are no routes within the client section that want to redirect
		// to auth if there is no logged in user. At the moment the only route under the client section is the
		// /upgrade route.
		const fromSection = Navigate.currentClientSection;
		if (!Navigate.isRedirecting && (!fromSection || fromSection !== 'client')) {
			Navigate.goto(Environment.authBaseUrl + '/login');
		}
	}
}
