import VueRouter from 'vue-router';
import { Navigate } from '../../components/navigate/navigate.service';
import { Api } from '../api/api.service';
import { Provider } from './linked-account.model';

export class LinkedAccounts {
	static async link(
		router: VueRouter,
		provider: Provider | '',
		routeUrl: string,
		resource: 'User' | 'Game',
		resourceId: number | null = null
	) {
		let url = routeUrl + provider + '?resource=' + resource;
		if (resourceId !== null) {
			url += '&resourceId=' + resourceId;
		}

		if (GJ_IS_CLIENT) {
			url += '&client';
		}

		const response = await Api.sendRequest(url, {});

		if (GJ_IS_CLIENT) {
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

	static async login(router: VueRouter, provider: Provider) {
		let url = '/web/auth/linked-accounts/link/' + provider;
		if (GJ_IS_CLIENT) {
			url += '?client';
		}

		const response = await Api.sendRequest(url, {});

		if (GJ_IS_CLIENT) {
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
