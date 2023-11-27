import { Component } from 'vue';
import { createLogger } from '../../../utils/logging';
import { sleep } from '../../../utils/utils';
import { isDynamicGoogleBot } from '../../device/device.service';
import { AdSlot } from '../ad-slot-info';
import { AdAdapter, AdAdapterHelper } from '../adapter-base';
import AppAdEnthusiast from './AppAdEnthusiast.vue';

interface EgAps {
	launchAds: () => void;
	reinstate: () => void;
	render: (slots: string[]) => void;
	refresh: (slots: string[]) => void;
}

export class AdEnthusiastAdapter implements AdAdapter {
	private logger = createLogger('Ads - Enthusiast');
	private helper = new AdAdapterHelper();
	private whenLoadedPromise?: Promise<void>;

	private get isLoaded() {
		const w = window as any;
		return w.egAps && typeof w.egAps.launchAds === 'function';
	}

	async run(cb: (egAps: EgAps) => void) {
		if (import.meta.env.SSR || isDynamicGoogleBot()) {
			return;
		}

		await this.ensureLoaded();

		const w = window as any;
		if (w.egAps && typeof w.egAps.launchAds === 'function') {
			cb(w.egAps);
		}
	}

	ensureLoaded() {
		this.helper.runOnce(() => {
			this.logger.info(`Loading...`);

			this.whenLoadedPromise = new Promise<void>(resolve => {
				// Enthusiast ad tag
				const xhr = new XMLHttpRequest();
				const url =
					'https://api.enthusiastgaming.net/scripts/cdn.enthusiast.gg/script/eg-aps/production/eg-aps-bootstrap.bundle.js?site=gamejolt.com';
				xhr.open('GET', url, true);
				xhr.onreadystatechange = () => {
					if (xhr.readyState !== 4) {
						return;
					}

					if (xhr.status !== 304 && (xhr.status < 200 || xhr.status >= 300)) {
						return;
					}

					const docHead =
						window.document.head || window.document.getElementsByTagName('head')[0];

					const script = window.document.createElement('script');
					script.type = 'text/javascript';
					script.text = xhr.responseText;
					docHead.appendChild(script);

					// Resolve on next tick.
					sleep(0).then(() => {
						this.logger.info(`Loaded.`);
						resolve();
					});
				};
				xhr.send(null);
			});

			// Google tag manager
			const win = window as any;
			win.dataLayer = win.dataLayer || [];
			win.dataLayer.push({
				'gtm.start': new Date().getTime(),
				event: 'gtm.js',
			});
			const f = window.document.getElementsByTagName('script')[0];
			const j = window.document.createElement('script');
			j.async = true;
			j.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-KCWT4SH2';
			f.parentNode!.insertBefore(j, f);
		});

		return this.whenLoadedPromise;
	}

	onBeforeRouteChange() {}

	onRouteChanged() {
		if (!this.isLoaded) {
			this.logger.info(`Skip reinstating since we're not fully loaded yet.`);
			return;
		}

		this.run(async egAps => {
			// They said we should wait a bit before reinstating ads.
			await sleep(500);

			this.logger.info(`Reinstating ads for new page.`);
			egAps.reinstate();
		});
	}

	component(_slot: AdSlot): Component {
		return AppAdEnthusiast;
	}
}
