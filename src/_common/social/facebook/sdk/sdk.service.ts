import { Analytics } from '../../../analytics/analytics.service';

function setupEvents() {
	(window as any).FB.Event.subscribe('edge.create', (url: string) => {
		Analytics.trackSocial(Analytics.SOCIAL_NETWORK_FB, Analytics.SOCIAL_ACTION_LIKE, url);
	});

	(window as any).FB.Event.subscribe('message.send', (url: string) => {
		Analytics.trackSocial(Analytics.SOCIAL_NETWORK_FB, Analytics.SOCIAL_ACTION_SEND, url);
	});
}

export class FacebookSdk {
	private static isBootstrapped = false;

	static load() {
		if (GJ_IS_SSR) {
			return;
		}

		if (!this.isBootstrapped) {
			const elem = document.createElement('div');
			elem.id = 'fb-root';
			document.body.appendChild(elem);

			let bootstrapLib = (d: any, s: any, id: any) => {
				let js: any,
					fjs = d.getElementsByTagName(s)[0];
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
