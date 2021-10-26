import { Component } from 'vue-property-decorator';
import { LocationRedirect } from '../../../../utils/router';
import {
	authOnLogin,
	getRedirectUrl,
	redirectToDashboard,
} from '../../../../_common/auth/auth.service';
import AppLoading from '../../../../_common/loading/loading.vue';
import { Navigate } from '../../../../_common/navigate/navigate.service';
import { AppProgressPoller } from '../../../../_common/progress/poller/poller';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';

@Component({
	name: 'RouteApproveLogin',
	components: {
		AppProgressPoller,
		AppLoading,
	},
})
@RouteResolver({
	async resolver({ route }) {
		if (!GJ_IS_SSR) {
			const pollingToken = sessionStorage.getItem('login-polling-token');
			if (!pollingToken) {
				return new LocationRedirect({
					name: 'auth.login',
					query: { redirect: route.query.redirect || undefined },
				});
			}

			sessionStorage.removeItem('login-polling-token');
			return pollingToken;
		}
		return null;
	},
})
export default class RouteApproveLogin extends BaseRouteComponent {
	pollingToken: string | null = null;

	isExpired = false;
	isRejected = false;

	get routeTitle() {
		return this.$gettext('Approve Login Location');
	}

	get isPolling() {
		return !this.isExpired && !this.isRejected;
	}

	routeResolved(pollingToken: string | null) {
		this.pollingToken = pollingToken;
	}

	async onApproved() {
		authOnLogin('email');

		const location = getRedirectUrl(this.$route.query.redirect as string);
		if (location) {
			Navigate.goto(location);
			return;
		}

		redirectToDashboard();
	}

	async onError(e: any) {
		if (e instanceof Error) {
			throw e;
		}

		if (e.status && e.status === 'error' && e.reason) {
			switch (e.reason) {
				case 'expired':
					this.isExpired = true;
					return;

				case 'rejected':
					this.isRejected = true;
					return;
			}
		}

		console.error('Invalid looking response from polling blocked login', e);
	}
}
