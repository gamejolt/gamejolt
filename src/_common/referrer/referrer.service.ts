import { Router } from 'vue-router';
import { onRouteChangeAfter } from '../route/route-component';

/**
 * Since we're in a single page app, the referrer doesn't get reset on every
 * page change. To be able to pull the correct referrer we need to spoof it by
 * updating on every state change. The initial referrer from the Document should
 * be correct when we first hit the page. If it's "null" then there was no
 * referrer when hitting the initial page.
 */
class ReferrerService {
	private isInitialized = false;

	/**
	 * We will set this to false after the first page change. We don't
	 * artifically track new referrers until after the first page has passed.
	 */
	private firstPass = true;

	/**
	 * After every location change we store the current URL. We can use this
	 * value as the referrer when switching to the next page.
	 */
	private url?: string;

	private _referrer?: string;

	init(router: Router) {
		this.isInitialized = true;

		if (!import.meta.env.SSR && window.document.referrer) {
			this._referrer = window.document.referrer;

			router.beforeEach((_to, _from, next) => {
				// Don't track until we've tracked on full page view.
				if (this.firstPass) {
					return next();
				}

				this._referrer = this.url;
				next();
			});

			onRouteChangeAfter.subscribe(() => {
				// We have finished the first state change.
				// We will now begin tracking new referrers.
				this.firstPass = false;
				this.url = window.location.href;
			});
		}
	}

	get referrer() {
		if (!this.isInitialized) {
			throw new Error(`Using Referrer before it's initialized.`);
		}

		return this._referrer;
	}
}

export const Referrer = /** @__PURE__ */ new ReferrerService();
