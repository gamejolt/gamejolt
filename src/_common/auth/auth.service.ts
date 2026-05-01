import { trackJoin, trackLogin } from '~common/analytics/analytics.service';
import { configSaveJoinOptions } from '~common/config/config.service';
import { BaseUrl, WttfBaseUrl } from '~common/environment/environment.service';
import { Navigate } from '~common/navigate/navigate.service';
import {
	endOnboarding,
	isOnboarding,
	startOnboarding,
} from '~common/onboarding/onboarding.service';

export type AuthMethod = 'email' | 'google' | 'facebook' | 'twitch' | 'apple';

export function redirectToOnboarding() {
	if (import.meta.env.SSR) {
		return;
	}

	startOnboarding();
	Navigate.goto(WttfBaseUrl + '/welcome');
}

export function redirectToDashboard() {
	if (import.meta.env.SSR) {
		return;
	}

	if (isOnboarding()) {
		endOnboarding();
	}

	// This is mainly for client.
	// It tells the intro animation that it should play the intro even if it can't find a user.
	sessionStorage.setItem('client-intro-login-play', 'play');
	Navigate.goto(WttfBaseUrl);
}

export function getRedirectUrl(redirectTo: string): string | null {
	if (redirectTo) {
		// We don't want them to be able to put in an offsite link as the
		// redirect URL. So we only open up certain domains. Otherwise we
		// simply attach it to the main domain.

		// Subdomain redirect: jams.gamejolt.io, fireside.gamejolt.com, etc.
		// This also handles main domain.
		if (redirectTo.search(/^https?:\/\/([a-zA-Z.]+\.)?gamejolt.(com|io)/) !== -1) {
			return redirectTo;
		}

		// Normal redirect, within the gamejolt.com domain.
		// This is domain-less so we'll redirect to the path.
		return BaseUrl + redirectTo;
	}

	return null;
}

export function authOnJoin(method: AuthMethod) {
	trackJoin(method);
	configSaveJoinOptions();
}

export function authOnLogin(method: AuthMethod) {
	trackLogin(method);
}

const OAuthPendingTokenKey = 'oauth_pending_token';

export function setOAuthPendingToken(token: string) {
	sessionStorage.setItem(OAuthPendingTokenKey, token);
}

export function consumeOAuthPendingToken() {
	const token = sessionStorage.getItem(OAuthPendingTokenKey);
	sessionStorage.removeItem(OAuthPendingTokenKey);
	return token;
}
