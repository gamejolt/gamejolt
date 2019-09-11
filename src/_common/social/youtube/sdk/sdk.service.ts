export class YoutubeSdk {
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
					js.src = 'https://apis.google.com/js/platform.js';
					fjs.parentNode.insertBefore(js, fjs);
				}
			};
			bootstrapLib(document, 'script', 'youtube-sdk');
		} else {
			setTimeout(() => {
				if (typeof (window as any).gapi !== 'undefined') {
					(window as any).gapi.ytsubscribe.go();
				}
			});
		}

		this.isBootstrapped = true;
	}
}
