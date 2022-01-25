import { unref, watch } from 'vue';
import { Api } from '../../api/api.service';
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
			if (!GJ_DISABLE_SECTION_REDIRECTS) {
				// Must be logged in to use client.
				this.authRedirect();
			} else {
				Api.sendRequest('/web/touch', null, { detach: true, processPayload: false }).then(
					response => {
						if (!response || !response.data || !response.data.user) {
							this.authRedirect();
						}
					}
				);
			}
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
		console.log('redirecting to auth');

		// TODO: This is a hack to fix redirect loop between the client sections and the auth section.
		// Since redirecting with window.location.href isnt really synchronous theres a race condition
		// between the time user service figures out it has no user and redirects to auth
		// and the init logic in client service to redirect to downgrade section.
		//
		// This hack will not hold if we have other sections under the 'client' section that need to redirect to auth if not logged in.
		const fromSection = Navigate.currentClientSection;
		if (!Navigate.isRedirecting && (!fromSection || fromSection !== 'client')) {
			Navigate.goto(Environment.authBaseUrl + '/login');
		}
	}
}
