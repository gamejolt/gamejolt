import { Injectable } from 'ng-metadata/core';
import { Meta } from '../lib/gj-lib-client/components/meta/meta-service';
import { Environment } from '../lib/gj-lib-client/components/environment/environment.service';

@Injectable('App')
export class App {
	user: any = null;
	shouldShowCoverImage = true;

	// We store these when they sign up so that we can log them in
	// once they authorize their account.
	credentials = {};

	get title() {
		return Meta.title;
	}
	set title(title: string | null) {
		Meta.title = title;
	}

	redirectDashboard() {
		// This is mainly for client.
		// It tells the intro animation that it should play the intro even if it can't find a user.
		window.sessionStorage.setItem('client-intro-login-play', 'play');
		window.location.href = Environment.wttfBaseUrl + '/dashboard';
	}
}
