import { trackJoin, trackLogin } from '../analytics/analytics.service';
import { configSaveJoinOptions } from '../config/config.service';
import { Environment } from '../environment/environment.service';
import { Navigate } from '../navigate/navigate.service';
import Onboarding from '../onboarding/onboarding.service';

export type AuthMethod = 'email' | 'google' | 'facebook' | 'twitch' | 'twitter' | 'apple';

export function redirectToOnboarding() {
	if (GJ_IS_SSR) {
		return;
	}

	Onboarding.start();
	Navigate.goto(Environment.wttfBaseUrl + '/welcome');
}

export function redirectToDashboard() {
	if (GJ_IS_SSR) {
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

export function authOnJoin(method: AuthMethod) {
	trackJoin(method);
	configSaveJoinOptions();
}

export function authOnLogin(method: AuthMethod) {
	trackLogin(method);
}
