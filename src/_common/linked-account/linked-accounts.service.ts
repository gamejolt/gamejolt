import { Router } from 'vue-router';
import { Api } from '../api/api.service';
import { Navigate } from '../navigate/navigate.service';
import { LinkedAccountProvider } from './linked-account.model';

export class LinkedAccounts {
	static async link(
		router: Router,
		provider: LinkedAccountProvider | '',
		routeUrl: string,
		resource: 'User' | 'Game',
		resourceId: number | null = null
	) {
		let url = routeUrl + provider + '?resource=' + resource;
		if (resourceId !== null) {
			url += '&resourceId=' + resourceId;
		}

		if (GJ_IS_DESKTOP_APP) {
			url += '&client';
		}

		const response = await Api.sendRequest(url, {});

		if (GJ_IS_DESKTOP_APP) {
			// Gotta open a browser window for them to complete the sign up/login.
			Navigate.gotoExternal(response.redirectLocation);

			// Now redirect them to the page that will continuously check if they
			// are linked yet. We pass in the request token returned since this is
			// what tells us our oauth state.
			router.push({
				name: 'dash.linking',
				query: { token: response.token },
			});
		} else {
			Navigate.goto(response.redirectLocation);
		}
	}

	static async login(router: Router, provider: LinkedAccountProvider) {
		let url = '/web/auth/linked-accounts/link/' + provider;
		if (GJ_IS_DESKTOP_APP) {
			url += '?client';
		}

		const response = await Api.sendRequest(url, {});

		if (GJ_IS_DESKTOP_APP) {
			// Gotta open a browser window for them to complete the sign up/login.
			Navigate.gotoExternal(response.redirectLocation);

			// Now redirect them to the page that will continuously check if they
			// are authed yet. We pass in the request token returned since this is
			// what tells us our oauth state.
			router.push({
				name: 'auth.linked-account.poll',
				params: { token: response.token },
			});
		} else {
			Navigate.goto(response.redirectLocation);
		}
	}
}
