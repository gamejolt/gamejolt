import {
	Analytics,
	SOCIAL_ACTION_LIKE,
	SOCIAL_ACTION_SEND,
	SOCIAL_NETWORK_FB,
} from '../../../analytics/analytics.service';
import { isGoogleBot } from '../../../device/device.service';

function setupEvents() {
	(window as any).FB.Event.subscribe('edge.create', (url: string) => {
		Analytics.trackSocial(SOCIAL_NETWORK_FB, SOCIAL_ACTION_LIKE, url);
	});

	(window as any).FB.Event.subscribe('message.send', (url: string) => {
		Analytics.trackSocial(SOCIAL_NETWORK_FB, SOCIAL_ACTION_SEND, url);
	});
}

export class FacebookSdk {
	private static isBootstrapped = false;

	static load() {
		if (import.meta.env.SSR || isGoogleBot()) {
			return;
		}

		if (!this.isBootstrapped) {
			const elem = document.createElement('div');
			elem.id = 'fb-root';
			document.body.appendChild(elem);

			const bootstrapLib = (d: any, s: any, id: any) => {
				const fjs = d.getElementsByTagName(s)[0];
				let js: any;
				if (!d.getElementById(id)) {
					js = d.createElement(s);
					js.id = id;
					js.onload = setupEvents;
					js.src =
						'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.4&appId=410666682312265';
					fjs.parentNode.insertBefore(js, fjs);
				}
			};
			bootstrapLib(document, 'script', 'facebook-jssdk');
		} else {
			setTimeout(() => {
				if (typeof (window as any).FB !== 'undefined') {
					(window as any).FB.XFBML.parse();
				}
			});
		}

		this.isBootstrapped = true;
	}
}
