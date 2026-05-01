import { isDynamicGoogleBot } from '~common/device/device.service';

export class FacebookSdk {
	private static isBootstrapped = false;

	static load() {
		if (import.meta.env.SSR || isDynamicGoogleBot()) {
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
