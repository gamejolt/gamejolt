import { Route } from 'vue-router';
import { LocationRedirect } from '../../../utils/router';
import { Growls } from '../../../_common/growls/growls.service';
import { Translate } from '../../../_common/translate/translate.service';

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

	static checkRoute(route: Route, ...intents: Intent[]) {
		if (route.query.intent) {
			for (let intent of intents) {
				if (route.query.intent === intent.intent) {
					Growls.info({
						sticky: true,
						message: intent.message,
					});
					break;
				}
			}
			return LocationRedirect.fromRoute(route, {}, { intent: undefined });
		}
		return null;
	}

	static checkApprovedLoginIntent(route: Route) {
		console.log(route);
		const approveLoginError = route.query.approve_login_error ?? null;
		if (approveLoginError) {
			if (approveLoginError === 'expired') {
				Growls.error({
					sticky: true,
					message: Translate.$gettext(
						`This login attempt has expired. Try logging in again.`
					),
				});
			} else if (approveLoginError === 'already-rejected') {
				Growls.error({
					sticky: true,
					message: Translate.$gettextInterpolate(
						`The device you're logging in from has been blocked. If you did not do this, or blocked the login by mistake, contact us at %{ email } right away. Your account may be compromised.`,
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
					message: Translate.$gettext('This login request has expired.'),
				});
			} else if (rejectLoginError === 'already-approved') {
				Growls.error({
					sticky: true,
					message: Translate.$gettextInterpolate(
						`The device you're logging in from has already been approved. If you did not do this, or blocked the login by mistake, contact us at %{ email } right away. Your account may be compromised.`,
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

		const intentRedirect = this.checkRoute(
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

		return intentRedirect;
	}
}
