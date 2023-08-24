import { isDynamicGoogleBot } from '../../../../_common/device/device.service';

export class GrecaptchaSdk {
	private static bootstrapPromise: Promise<void> | null = null;

	static load() {
		if (import.meta.env.SSR || isDynamicGoogleBot()) {
			return;
		}

		if (!this.bootstrapPromise) {
			this.bootstrapPromise = new Promise((resolve, reject) => {
				let bootstrapLib = (d: Document, id: string) => {
					(window as any).grecaptchaOnLoaded = () => resolve();

					let js: HTMLScriptElement,
						fjs = d.getElementsByTagName('script')[0];
					if (!d.getElementById(id)) {
						js = d.createElement('script');
						js.id = id;
						js.type = 'text/javascript';
						js.src =
							'https://www.google.com/recaptcha/api.js?onload=grecaptchaOnLoaded&render=explicit';
						js.onerror = err => reject('Failed to load recaptcha api: ' + err.message);
						fjs.parentNode!.insertBefore(js, fjs);
					}
				};
				bootstrapLib(document, 'grecaptcha-sdk');
			});
		}

		return this.bootstrapPromise;
	}
}
