import { Environment } from '../environment/environment.service';
import { Navigate } from '../navigate/navigate.service';
import Onboarding from '../onboarding/onboarding.service';

export class Auth {
	static redirectOnboarding() {
		if (GJ_IS_SSR) {
			return;
		}

		Onboarding.start();
		Navigate.goto(Environment.wttfBaseUrl + '/welcome');
	}

	static redirectDashboard() {
		if (GJ_IS_SSR) {
			return;
		}

		if (Onboarding.isOnboarding) {
			Onboarding.end();
		}

		// This is mainly for client.
		// It tells the intro animation that it should play the intro even if it can't find a user.
		window.sessionStorage.setItem('client-intro-login-play', 'play');
		Navigate.goto(Environment.wttfBaseUrl);
	}
}
