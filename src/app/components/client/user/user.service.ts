import { EventBus } from '../../../../lib/gj-lib-client/components/event-bus/event-bus.service';
import { User } from '../../../../lib/gj-lib-client/components/user/user.model';
import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';

export class ClientUser {
	static init() {
		EventBus.on('Payload.userProcessed', () => this.checkPayloadUser());

		// We bootstrap the client with the previously stored user if there was any.
		// This way they can access client offline with their previous user.
		const localUser = localStorage.getItem('user');
		if (localUser) {
			App.user = new User(JSON.parse(localUser));

			// Gotta fake a userProcessed event so that anything that watches that gets notified.
			EventBus.emit('Payload.userProcessed', true);
		}
	}

	static checkPayloadUser() {
		if (App.user) {
			localStorage.setItem('user', JSON.stringify(App.user));
		} else {
			localStorage.removeItem('user');

			// If they're logged out in client, we have to force to auth page..
			this.authRedirect();
		}
	}

	static authRedirect() {
		window.location.href = Environment.authBaseUrl + '/login';
	}
}
