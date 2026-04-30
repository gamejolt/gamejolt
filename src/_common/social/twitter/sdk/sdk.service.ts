import { isDynamicGoogleBot } from '~common/device/device.service';

export class TwitterSdk {
	private static isBootstrapped = false;

	static load() {
		if (import.meta.env.SSR || isDynamicGoogleBot()) {
			return;
		}

		if (!this.isBootstrapped) {
			const bootstrapLib = (d: any, s: any, id: any) => {
				const fjs = d.getElementsByTagName(s)[0];
				let js: any;
				if (!d.getElementById(id)) {
					js = d.createElement(s);
					js.id = id;
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
