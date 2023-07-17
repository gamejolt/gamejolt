import {
	Analytics,
	SOCIAL_ACTION_FOLLOW,
	SOCIAL_ACTION_TWEET,
	SOCIAL_NETWORK_TWITTER,
} from '../../../analytics/analytics.service';
import { isGoogleBot } from '../../../device/device.service';

function setupEvents() {
	(window as any).twttr.events.bind('tweet', () => {
		const url = window.location.href;
		Analytics.trackSocial(SOCIAL_NETWORK_TWITTER, SOCIAL_ACTION_TWEET, url);
	});

	(window as any).twttr.events.bind('follow', () => {
		const url = window.location.href;
		Analytics.trackSocial(SOCIAL_NETWORK_TWITTER, SOCIAL_ACTION_FOLLOW, url);
	});
}

export class TwitterSdk {
	private static isBootstrapped = false;

	static load() {
		if (import.meta.env.SSR || isGoogleBot()) {
			return;
		}

		if (!this.isBootstrapped) {
			const bootstrapLib = (d: any, s: any, id: any) => {
				const fjs = d.getElementsByTagName(s)[0];
				let js: any;
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
