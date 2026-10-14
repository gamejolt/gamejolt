import { AdPageView } from '~common/ad/ad-page-view';
import { AdProvider } from '~common/ad/ad-provider';

/**
 * The ad store drives every adapter through this. Adapters are only ever
 * created on devices that are allowed to show ads.
 */
export type AdAdapterBase = {
	provider: AdProvider;

	/**
	 * Called once when the ad store is created.
	 */
	init(): void;

	/**
	 * A route change has started. The previous page is about to go away.
	 */
	onBeforeRouteChange(): void;

	/**
	 * The new page has resolved and rendered. When [isCorrection] is true, the
	 * page view for this route was already sent, but the page's ad settings
	 * changed after the fact.
	 */
	onPageView(pageView: AdPageView, options: { isCorrection: boolean }): void;
};

/**
 * Checks that an adapter implements the base while keeping its own extra
 * functions in the returned type.
 */
export function defineAdAdapter<T extends AdAdapterBase>(adapter: T) {
	return adapter;
}
