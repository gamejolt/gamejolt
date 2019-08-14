import VueRouter from 'vue-router';
import { AdsDisabledDev } from '../../../components/ad/ads.service';
import AppAdPlaywireVideo from '../../../components/ad/playwire/video';
import { EventBus } from '../../../components/event-bus/event-bus.service';
import { loadScript } from '../../../utils/utils';
import AppAdPlaywire from './playwire';

let _isInitialized = false;

type AdComponent = AppAdPlaywire | AppAdPlaywireVideo;

export class Playwire {
	private static routeResolved = false;
	private static ads: Set<AdComponent> = new Set();

	static init(router: VueRouter) {
		if (GJ_IS_CLIENT || GJ_IS_SSR || AdsDisabledDev) {
			return;
		}

		if (_isInitialized) {
			return;
		}
		_isInitialized = true;

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
		router.beforeEach((_to, _from, next) => {
			this.routeResolved = false;
			next();
		});

		EventBus.on('routeChangeAfter', () => {
			this.routeResolved = true;
			this.displayAds(Array.from(this.ads));
		});
	}

	static addAd(ad: AdComponent) {
		this.ads.add(ad);

		// If the route already resolved then this ad was mounted after the
		// fact. We have to call the initial display.
		if (this.routeResolved) {
			this.displayAds([ad]);
		}
	}

	static removeAd(ad: AdComponent) {
		this.ads.delete(ad);
	}

	private static async displayAds(ads: AdComponent[]) {
		if (!ads.length || !_isInitialized) {
			return;
		}

		for (const ad of ads) {
			ad.display();
		}
	}
}
