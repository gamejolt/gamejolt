import {
	inject,
	InjectionKey,
	nextTick,
	onUnmounted,
	provide,
	ref,
	shallowReadonly,
	shallowRef,
	toRef,
	watch,
} from 'vue';
import { RouteLocationNormalized, useRouter } from 'vue-router';

import { AdPageType, AdPageView, getAdPageType } from '~common/ad/ad-page-view';
import { resolveAdProvider } from '~common/ad/ad-provider';
import { createAdBridgAdapter } from '~common/ad/adbridg/adbridg-adapter';
import { createMonetizeMoreAdapter } from '~common/ad/monetizemore/monetizemore-adapter';
import { isDynamicGoogleBot } from '~common/device/device.service';
import { Model } from '~common/model/model.service';
import { AppRouteOptionsInternal, onRouteChangeAfter } from '~common/route/route-component';
import { useCommonStore } from '~common/store/common-store';
import { objectEquals } from '~utils/object';
import { loadScript } from '~utils/utils';

export type AdStore = ReturnType<typeof createAdStore>;
const AdStoreKey: InjectionKey<AdStore> = Symbol('ads');

// To show ads on the page for dev, just change this to false.
export const AdsDisabledDev = GJ_BUILD_TYPE === 'serve-hmr' || GJ_BUILD_TYPE === 'serve-build';
// export const AdsDisabledDev = false;

const areAdsDisabledForDevice =
	GJ_IS_DESKTOP_APP || import.meta.env.SSR || isDynamicGoogleBot() || AdsDisabledDev;

export class AdSettingsContainer {
	isPageDisabled = false;
	resource: Model | null = null;
}

export function createAdStore() {
	const { user } = useCommonStore();

	const provider = resolveAdProvider();
	const adapter = provider === 'adbridg' ? createAdBridgAdapter() : createMonetizeMoreAdapter();

	const pageSettings = ref<AdSettingsContainer | null>(null);
	const _defaultSettings = new AdSettingsContainer();
	const targetingTags = ref<string[]>([]);

	/**
	 * The page type of the current route, once it has resolved. Null while a
	 * route change is in progress.
	 */
	const pageType = ref<AdPageType | null>(null);

	const settings = toRef(() => pageSettings.value || _defaultSettings);

	/**
	 * Whether the current page allows ads at all, regardless of device.
	 */
	const allowAdsOnPage = toRef(() => !settings.value.isPageDisabled);

	const shouldShow = toRef(() => {
		if (areAdsDisabledForDevice) {
			return false;
		}

		return allowAdsOnPage.value;
	});

	const hasTakeover = ref(false);
	const videoAdsLoadPromise = shallowRef<Promise<void> | null>(null);
	const videoAdsLoaded = ref(false);

	const c = shallowReadonly({
		adapter,
		pageSettings,
		settings,
		shouldShow,
		hasTakeover,
		videoAdsLoadPromise,
		videoAdsLoaded,
		targetingTags,
	});
	provide(AdStoreKey, c);

	if (areAdsDisabledForDevice) {
		return c;
	}

	adapter.init();

	const router = useRouter();

	/**
	 * Whether we've told the adapter about the current page yet.
	 */
	let sentPageView = false;

	function _buildPageView(type: AdPageType): AdPageView {
		return {
			pageType: type,
			loggedIn: !!user.value,
			// Pages without an ad section never had ads, so keep it that way.
			allowAds: type !== 'other' && allowAdsOnPage.value,
			targetingTags: targetingTags.value,
		};
	}

	// We set up events so that we know when a route begins and when the
	// routing is fully resolved.
	const beforeDeregister = router.beforeEach((to, from, next) => {
		// Make sure we only update if the route actually changed,
		// since this gets called even if just a simple hash has
		// changed.
		if (_didRouteChange(from, to)) {
			adapter.onBeforeRouteChange();
			pageType.value = null;
			sentPageView = false;

			// The new route's payload will set new ones if it has any.
			targetingTags.value = [];
		}
		next();
	});

	const routeAfter$ = onRouteChangeAfter.subscribe(() => _onPageResolved());

	// Routes without a resolver never emit [onRouteChangeAfter], so we have to
	// send their page view as soon as the navigation finishes. 404s don't
	// match any route and are handled the same way.
	const afterDeregister = router.afterEach((to, from, failure) => {
		if (!failure && _didRouteChange(from, to) && !_hasRouteResolver(to)) {
			_onPageResolved();
		}
	});

	// The app mounts after the initial navigation finished, so the afterEach
	// hook above missed the page we landed on.
	if (!_hasRouteResolver(router.currentRoute.value)) {
		_onPageResolved();
	}

	async function _onPageResolved() {
		if (pageType.value) {
			return;
		}

		const type = getAdPageType(router.currentRoute.value);
		pageType.value = type;

		// Wait for the resolved page to render so that its ad slots are in
		// the DOM.
		await nextTick();

		// The route may have changed again while we were waiting.
		if (pageType.value !== type) {
			return;
		}

		adapter.onPageView(_buildPageView(type), { isCorrection: false });
		sentPageView = true;
	}

	// A page may set its ad settings after the route resolved, for example
	// when a parent route resolves after its child. Let the adapter know so
	// it doesn't keep running with the wrong settings.
	watch(allowAdsOnPage, () => {
		if (!pageType.value || !sentPageView) {
			return;
		}

		adapter.onPageView(_buildPageView(pageType.value), { isCorrection: true });
	});

	onUnmounted(() => {
		beforeDeregister();
		afterDeregister();
		routeAfter$.close();
	});

	return c;
}

function _didRouteChange(from: RouteLocationNormalized, to: RouteLocationNormalized) {
	// We don't want to consider a route changing if just the hash changed. This
	// helps with stuff like media bar.
	return (
		from.path !== to.path ||
		!objectEquals(from.params, to.params) ||
		!objectEquals(from.query, to.query)
	);
}

/**
 * Only the deepest route with app route options emits [onRouteChangeAfter], and
 * only when it has a resolver.
 */
function _hasRouteResolver(route: RouteLocationNormalized) {
	for (const record of [...route.matched].reverse()) {
		const component = record.components?.default as
			| { appRouteOptions?: AppRouteOptionsInternal }
			| undefined;

		if (component?.appRouteOptions) {
			return !!component.appRouteOptions.resolver;
		}
	}

	return false;
}

export function useAdStore() {
	return inject(AdStoreKey)!;
}

export function setPageAdsSettings({ pageSettings }: AdStore, container: AdSettingsContainer) {
	pageSettings.value = container;
}

export function releasePageAdsSettings({ pageSettings }: AdStore) {
	pageSettings.value = null;
}

export async function loadVideoAdsTag({ videoAdsLoadPromise, videoAdsLoaded }: AdStore) {
	if (areAdsDisabledForDevice) {
		throw new Error(`Ads disabled for device.`);
	}

	if (videoAdsLoadPromise.value) {
		return videoAdsLoadPromise.value;
	}

	videoAdsLoadPromise.value = loadScript(
		'https://imasdk.googleapis.com/js/sdkloader/ima3.js'
	).then(() => {
		videoAdsLoaded.value = true;
	});

	return videoAdsLoadPromise.value;
}

export function setAdsTargetingTags({ targetingTags }: AdStore, tags: string[]) {
	if (areAdsDisabledForDevice) {
		console.info('Not setting ad targeting tags since ads are disabled for device.');
		return;
	}

	// Stored centrally so that the adapters and video ads can use them.
	targetingTags.value = tags;
}
