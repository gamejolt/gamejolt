import { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';
import { router } from '..';
import { LocationRedirect } from '../../../utils/router';
import { Api } from '../../../_common/api/api.service';
import { Growls } from '../../../_common/growls/growls.service';
import { Meta } from '../../../_common/meta/meta-service';
import {
	asyncRouteLoader,
	BaseRouteComponent,
	RouteResolver,
} from '../../../_common/route/route-component';
import { AppState, AppStore } from '../../../_common/store/app-store';
import { Translate } from '../../../_common/translate/translate.service';
import { IntentService } from '../../components/intent/intent.service';
import { HomeFeedService } from './home-feed.service';

@Component({
	name: 'RouteHome',
	components: {
		RouteHomeFeed: () => asyncRouteLoader(import('./feed.vue'), router),
		RouteDiscoverHome: () => asyncRouteLoader(import('../discover/home/home.vue'), router),
	},
})
@RouteResolver({
	lazy: true,
	deps: { query: ['intent', 'approve_login_error', 'reject_login_error'] },
	resolver: async ({ route }) => {
		const approveLoginError = route.query.approve_login_error ?? null;
		if (approveLoginError) {
			if (approveLoginError === 'expired') {
				Growls.error({
					sticky: true,
					message: Translate.$gettext(
						'This login request has been expired. Try logging in again.'
					),
				});
			} else if (approveLoginError === 'already-rejected') {
				Growls.error({
					sticky: true,
					message: Translate.$gettextInterpolate(
						'This login request has already been rejected. If this not your doing or is a mistake, contact us at %{ email } to undo the block.',
						{ email: 'contact@gamejolt.com' }
					),
				});
			}

			return LocationRedirect.fromRoute(
				route,
				{},
				{ intent: undefined, approve_login_error: undefined }
			);
		}

		const rejectLoginError = route.query.reject_login_error ?? null;
		if (rejectLoginError) {
			if (rejectLoginError === 'expired') {
				Growls.error({
					sticky: true,
					message: Translate.$gettext('This login request has been expired.'),
				});
			} else if (rejectLoginError === 'already-approved') {
				Growls.error({
					sticky: true,
					message: Translate.$gettextInterpolate(
						'This login request has already been approved. If this was not your doing, contact us at %{ email } right away. Your account may be compromised.',
						{ email: 'contact@gamejolt.com' }
					),
				});
			}

			return LocationRedirect.fromRoute(
				route,
				{},
				{ intent: undefined, reject_login_error: undefined }
			);
		}

		const intentRedirect = IntentService.checkRoute(
			route,
			{
				intent: 'approve-login',
				message: Translate.$gettext('Login request approved.'),
			},
			{
				intent: 'reject-login',
				message: Translate.$gettext('Login request rejected.'),
			}
		);
		if (intentRedirect) {
			return intentRedirect;
		}

		return await Api.sendRequest('/web/touch');
	},
})
export default class RouteHome extends BaseRouteComponent {
	@AppState
	user!: AppStore['user'];

	@AppState
	userBootstrapped!: AppStore['userBootstrapped'];

	routeCreated() {
		Meta.setTitle(null);
	}

	routeResolved() {
		// The route content, but not the path, changes depending on the user
		// state - so we need to track the page view through a analyticsPath
		// meta value that aligns with our route content.
		let analyticsPath = '/discover';
		if (this.user) {
			if (this.$route.params?.tab === HomeFeedService.fypTab) {
				analyticsPath = '/fyp';
			} else if (this.$route.params?.tab === HomeFeedService.activityTab) {
				analyticsPath = '/'; // For clarification purposes that "activity" => "/".
			} else {
				analyticsPath = '/';
			}
		}

		this.$route.meta.analyticsPath = analyticsPath;
	}

	render(h: CreateElement) {
		if (!this.userBootstrapped) {
			return h('div');
		}

		return h(this.user ? 'RouteHomeFeed' : 'RouteDiscoverHome');
	}
}
