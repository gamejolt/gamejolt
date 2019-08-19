import { Analytics } from '../../../analytics/analytics.service';

function setupEvents() {
	(window as any).twttr.events.bind('tweet', () => {
		const url = window.location.href;
		Analytics.trackSocial(Analytics.SOCIAL_NETWORK_TWITTER, Analytics.SOCIAL_ACTION_TWEET, url);
	});

	(window as any).twttr.events.bind('follow', () => {
		const url = window.location.href;
		Analytics.trackSocial(Analytics.SOCIAL_NETWORK_TWITTER, Analytics.SOCIAL_ACTION_FOLLOW, url);
	});
}

export class TwitterSdk {
	private static isBootstrapped = false;

	static load() {
		if (GJ_IS_SSR) {
			return;
		}

		if (!this.isBootstrapped) {
			let bootstrapLib = (d: any, s: any, id: any) => {
				let js: any,
					fjs = d.getElementsByTagName(s)[0];
				if (!d.getElementById(id)) {
					js = d.createElement(s);
					js.id = id;
					js.onload = setupEvents;
					js.src = 'https://platform.twitter.com/widgets.js';
					fjs.parentNode.insertBefore(js, fjs);
				}
			};
			bootstrapLib(document, 'script', 'twitter-wjs');
		} else {
			setTimeout(() => {
				if (typeof (window as any).twttr !== 'undefined') {
					(window as any).twttr.widgets.load();
				}
			});
		}

		this.isBootstrapped = true;
	}
}
