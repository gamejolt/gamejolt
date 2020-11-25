import Component from 'vue-class-component';
import { LocationRedirect } from '../../../utils/router';
import { Api } from '../../../_common/api/api.service';
import AppContactLink from '../../../_common/contact-link/contact-link.vue';
import { Growls } from '../../../_common/growls/growls.service';
import AppLinkHelp from '../../../_common/link/help/help.vue';
import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';
import { AppMutation, AppState, appStore, AppStore } from '../../../_common/store/app-store';
import { AppThemeSvg } from '../../../_common/theme/svg/svg';
import { AppTimeAgo } from '../../../_common/time/ago/ago';
import { UserTimeout } from '../../../_common/user/timeout/timeout.model';

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

	@AppMutation
	setTimeout!: AppStore['setTimeout'];

	isExpired = false;
	updateTimer?: NodeJS.Timer;
	isClearingResource = false;

	get routeTitle() {
		return this.$gettext(`You've been put in time-out.`);
	}

	get isActive() {
		return this.timeout?.getIsActive();
	}

	get reasonText() {
		const reasons: string[] = [];
		if (this.timeout?.reason_template) {
			reasons.push(this.timeout.reason_template);
		}
		if (this.timeout?.reason) {
			reasons.push(this.timeout.reason);
		}

		if (!reasons.length) {
			return null;
		}

		return reasons.join('\n---\n');
	}

	get resourceText() {
		return 'Your Comment\n"I hate you"';
	}

	mounted() {
		this.updateTimer = setInterval(this.updateExpired, 100);
	}

	updateExpired() {
		if (this.timeout) {
			this.isExpired = this.timeout.getIsExpired();
		} else {
			this.isExpired = true;
		}
	}

	async onClickClearResource() {
		if (this.isClearingResource) {
			return;
		}

		this.isClearingResource = true;

		const payload = await Api.sendRequest('/web/dash/timeout/clear-resource', {});
		if (payload && payload.success) {
			const newTimeout = new UserTimeout(payload.timeout);
			this.setTimeout(newTimeout);

			this.updateExpired();
			Growls.info(this.$gettext(`The content has been removed.`));
		} else {
			Growls.error(this.$gettext(`Failed to remove content.`));
		}

		this.isClearingResource = false;
	}
}
