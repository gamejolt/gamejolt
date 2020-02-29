import { loadScript } from '../../../utils/utils';
import { installVuePlugin } from '../../../utils/vue';
import { EventBus } from '../../event-bus/event-bus.service';
import { AdsDisabledDev } from '../ad-store';
import AppAdPlaywire from './playwire';
import AppAdPlaywireVideo from './video';

declare module 'vue/types/vue' {
	interface Vue {
		$playwire: PlaywireStore;
	}
}

type AdComponent = AppAdPlaywire | AppAdPlaywireVideo;

export class PlaywireStore {
	private isInitialized = false;
	private routeResolved = false;
	// TODO: WeakSet?
	private ads: Set<AdComponent> = new Set();

	static install() {
		installVuePlugin('$playwire', this, function(vm) {
			if (GJ_IS_CLIENT || GJ_IS_SSR || AdsDisabledDev) {
				return;
			}

			if (this.isInitialized) {
				return;
			}

			this.isInitialized = true;

			(window as any).tyche = {
				mode: 'tyche',
				config: 'https://config.playwire.com/1391/v2/websites/30391/banner.json',
				observerMode: {
					enabled: true,
					selector: 'root',
				},
			};

			loadScript('https://cdn.intergi.com/hera/tyche.js');

			// We set up events so that we know when a route begins and when the
			// routing is fully resolved.
			vm.$router.beforeEach((_to, _from, next) => {
				this.routeResolved = false;
				next();
			});

			EventBus.on('routeChangeAfter', () => {
				this.routeResolved = true;
				this.displayAds(Array.from(this.ads));
			});
		});
	}

	addAd(ad: AdComponent) {
		this.ads.add(ad);

		// If the route already resolved then this ad was mounted after the
		// fact. We have to call the initial display.
		if (this.routeResolved) {
			this.displayAds([ad]);
		}
	}

	removeAd(ad: AdComponent) {
		this.ads.delete(ad);
	}

	private async displayAds(ads: AdComponent[]) {
		if (!ads.length || !this.isInitialized) {
			return;
		}

		for (const ad of ads) {
			ad.display();
		}
	}
}
