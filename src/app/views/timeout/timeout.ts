import { Options } from 'vue-property-decorator';
import { LocationRedirect } from '../../../utils/router';
import { Api } from '../../../_common/api/api.service';
import AppContactLink from '../../../_common/contact-link/contact-link.vue';
import { showErrorGrowl, showInfoGrowl } from '../../../_common/growls/growls.service';
import AppIllustration from '../../../_common/illustration/illustration.vue';
import AppLinkHelp from '../../../_common/link/help/help.vue';
import { Navigate } from '../../../_common/navigate/navigate.service';
import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';
import { Screen } from '../../../_common/screen/screen-service';
import { AppMutation, AppState, appStore, AppStore } from '../../../_common/store/app-store';
import { AppThemeSvg } from '../../../_common/theme/svg/svg';
import { AppTimeAgo } from '../../../_common/time/ago/ago';
import { UserTimeout } from '../../../_common/user/timeout/timeout.model';

@Options({
	name: 'RouteTimeout',
	components: {
		AppThemeSvg,
		AppTimeAgo,
		AppLinkHelp,
		AppContactLink,
		AppIllustration,
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

	get logoScale() {
		if (Screen.isSm || Screen.isXs) {
			return 1;
		}
		return 2;
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
			showInfoGrowl(this.$gettext(`The content has been removed.`));
		} else {
			showErrorGrowl(this.$gettext(`Failed to remove content.`));
		}

		this.isClearingResource = false;
	}

	onClickLeave() {
		Navigate.reload();
	}
}
