import { trackJoin, trackLogin } from '../analytics/analytics.service';
import { configSaveJoinOptions } from '../config/config.service';
import { Environment } from '../environment/environment.service';
import { Navigate } from '../navigate/navigate.service';
import Onboarding from '../onboarding/onboarding.service';

export type AuthMethod = 'email' | 'google' | 'facebook' | 'twitch' | 'apple';

export function redirectToOnboarding() {
	if (import.meta.env.SSR) {
		return;
	}

	Onboarding.start();
	Navigate.goto(Environment.wttfBaseUrl + '/welcome');
}

export function redirectToDashboard() {
	if (import.meta.env.SSR) {
		return;
	}

	if (Onboarding.isOnboarding) {
		Onboarding.end();
	}

	// This is mainly for client.
	// It tells the intro animation that it should play the intro even if it can't find a user.
	sessionStorage.setItem('client-intro-login-play', 'play');
	Navigate.goto(Environment.wttfBaseUrl);
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
		return Environment.baseUrl + redirectTo;
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
