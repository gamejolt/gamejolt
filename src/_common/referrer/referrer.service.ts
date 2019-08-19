import VueRouter from 'vue-router';
import { EventBus } from '../event-bus/event-bus.service';

/**
 * Since we're in a single page app, the referrer doesn't get reset on every
 * page change. To be able to pull the correct referrer we need to spoof it by
 * updating on every state change. The initial referrer from the Document should
 * be correct when we first hit the page. If it's "null" then there was no
 * referrer when hitting the initial page.
 */
export class Referrer {
	private static isInitialized = false;

	/**
	 * We will set this to false after the first page change. We don't
	 * artifically track new referrers until after the first page has passed.
	 */
	private static firstPass = true;

	/**
	 * After every location change we store the current URL. We can use this
	 * value as the referrer when switching to the next page.
	 */
	private static url?: string;

	private static _referrer?: string;

	static init(router: VueRouter) {
		this.isInitialized = true;

		if (!GJ_IS_SSR && window.document.referrer) {
			this._referrer = window.document.referrer;

			router.beforeEach((_to, _from, next) => {
				// Don't track until we've tracked on full page view.
				if (this.firstPass) {
					return next();
				}

				this._referrer = this.url;
				next();
			});

			EventBus.on('routeChangeAfter', () => {
				// We have finished the first state change.
				// We will now begin tracking new referrers.
				this.firstPass = false;
				this.url = window.location.href;
			});
		}
	}

	static get referrer() {
		if (!this.isInitialized) {
			throw new Error(`Using Referrer before it's initialized.`);
		}

		return this._referrer;
	}
}
