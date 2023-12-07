import { RouteLocationNormalized } from 'vue-router';
import { showErrorGrowl, showInfoGrowl } from '../../../_common/growls/growls.service';
import { $gettext } from '../../../_common/translate/translate.service';
import { locationRedirectFromRoute } from '../../../utils/router';

export interface Intent {
	intent: string;
	message: string;
}

export class IntentService {
	static readonly APPROVED_LOGIN_QUERY_PARAMS = [
		'intent',
		'approve_login_error',
		'reject_login_error',
	];

	static checkRoute(route: RouteLocationNormalized, ...intents: Intent[]) {
		if (route.query.intent) {
			for (const intent of intents) {
				if (route.query.intent === intent.intent) {
					showInfoGrowl({
						sticky: true,
						message: intent.message,
					});
					break;
				}
			}
			return locationRedirectFromRoute(route, {}, { intent: undefined });
		}
		return null;
	}

	static checkApprovedLoginIntent(route: RouteLocationNormalized) {
		const approveLoginError = route.query.approve_login_error ?? null;
		if (approveLoginError) {
			if (approveLoginError === 'expired') {
				showErrorGrowl({
					sticky: true,
					message: $gettext(`This login attempt has expired. Try logging in again.`),
				});
			} else if (approveLoginError === 'already-rejected') {
				showErrorGrowl({
					sticky: true,
					message: $gettext(
						`The device you're logging in from has been blocked. If you did not do this, or blocked the login by mistake, contact us at %{ email } right away. Your account may be compromised.`,
						{ email: 'contact@gamejolt.com' }
					),
				});
			}

			return locationRedirectFromRoute(
				route,
				{},
				{ intent: undefined, approve_login_error: undefined }
			);
		}

		const rejectLoginError = route.query.reject_login_error ?? null;
		if (rejectLoginError) {
			if (rejectLoginError === 'expired') {
				showErrorGrowl({
					sticky: true,
					message: $gettext('This login request has expired.'),
				});
			} else if (rejectLoginError === 'already-approved') {
				showErrorGrowl({
					sticky: true,
					message: $gettext(
						`The device you're logging in from has already been approved. If you did not do this, or blocked the login by mistake, contact us at %{ email } right away. Your account may be compromised.`,
						{ email: 'contact@gamejolt.com' }
					),
				});
			}

			return locationRedirectFromRoute(
				route,
				{},
				{ intent: undefined, reject_login_error: undefined }
			);
		}

		const intentRedirect = this.checkRoute(
			route,
			{
				intent: 'approve-login',
				message: $gettext('Login request approved.'),
			},
			{
				intent: 'reject-login',
				message: $gettext('Login request rejected.'),
			}
		);

		return intentRedirect;
	}
}
