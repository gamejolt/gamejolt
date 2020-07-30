import Component from 'vue-class-component';
import { LocationRedirect } from '../../../utils/router';
import { Api } from '../../../_common/api/api.service';
import AppContactLink from '../../../_common/contact-link/contact-link.vue';
import AppLinkHelp from '../../../_common/link/help/help.vue';
import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';
import { AppState, appStore, AppStore } from '../../../_common/store/app-store';
import { AppThemeSvg } from '../../../_common/theme/svg/svg';
import { AppTimeAgo } from '../../../_common/time/ago/ago';

@Component({
	name: 'RouteTimeout',
	components: {
		AppThemeSvg,
		AppTimeAgo,
		AppLinkHelp,
		AppContactLink,
	},
})
@RouteResolver({
	resolver: async () => {
		const payload = await Api.sendRequest('/web/touch');

		// Redirect to home for guests or users without active timeouts.
		if (!!appStore.user || !appStore.state.isUserTimedOut) {
			return new LocationRedirect({
				name: 'home',
			});
		}

		return payload;
	},
})
export default class RouteTimeout extends BaseRouteComponent {
	@AppState
	timeout!: AppStore['timeout'];

	isExpired = false;
	updateTimer?: NodeJS.Timer;

	mounted() {
		this.updateTimer = setInterval(this.updateExpired, 100);
	}

	updateExpired() {
		if (this.timeout) {
			this.isExpired = this.timeout.isExpired;
		} else {
			this.isExpired = true;
		}
	}
}
