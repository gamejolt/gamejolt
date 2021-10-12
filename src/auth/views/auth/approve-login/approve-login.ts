import { Component } from 'vue-property-decorator';
import { authOnLogin, redirectToDashboard } from '../../../../_common/auth/auth.service';
import AppLoading from '../../../../_common/loading/loading.vue';
import { AppProgressPoller } from '../../../../_common/progress/poller/poller';
import { BaseRouteComponent } from '../../../../_common/route/route-component';

@Component({
	name: 'RouteApproveLogin',
	components: {
		AppProgressPoller,
		AppLoading,
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

	routeCreated() {
		if (!GJ_IS_SSR) {
			this.pollingToken = sessionStorage.getItem('login-polling-token');
			if (!this.pollingToken) {
				this.$router.push({ name: 'auth.login' });
				return;
			}

			sessionStorage.removeItem('login-polling-token');
		}
	}

	async onApproved() {
		// TODO: the approved login flow does not respect AppAuthLogin's redirectTo property
		// since we've been navigated away.
		authOnLogin('email');
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
