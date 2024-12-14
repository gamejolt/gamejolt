import { inject, InjectionKey, onUnmounted, provide, ref, shallowReadonly, toRef } from 'vue';
import { RouteLocationNormalized, useRouter } from 'vue-router';
import { objectEquals } from '../../utils/object';
import { isDynamicGoogleBot } from '../device/device.service';
import { Model } from '../model/model.service';
import { onRouteChangeAfter } from '../route/route-component';
import { AdAdapter } from './adapter-base';
import { AdGptAdapter } from './gpt/gpt-adapter';
import { AdProperAdapter } from './proper/proper-adapter';

type AdStore = ReturnType<typeof createAdStore>;
const AdStoreKey: InjectionKey<AdStore> = Symbol('ads');

// To show ads on the page for dev, just change this to false.
export const AdsDisabledDev = GJ_BUILD_TYPE === 'serve-hmr' || GJ_BUILD_TYPE === 'serve-build';
// export const AdsDisabledDev = false;

const areAdsDisabledForDevice =
	GJ_IS_DESKTOP_APP || import.meta.env.SSR || isDynamicGoogleBot() || AdsDisabledDev;

/**
 * This is the interface that our ad components must register with us.
 */
export type AdInterface = { display: () => void };

export class AdSettingsContainer {
	isPageDisabled = false;
	resource: Model | null = null;
}

export function createAdStore() {
	const routeResolved = ref(false);
	const ads = ref(new Set<AdInterface>());
	const pageSettings = ref<AdSettingsContainer | null>(null);
	const _defaultSettings = new AdSettingsContainer();

	const adapter: AdAdapter = new AdProperAdapter();
	const takeoverAdapter: AdGptAdapter = new AdGptAdapter();

	const settings = toRef(() => pageSettings.value || _defaultSettings);

	const shouldShow = toRef(() => {
		if (areAdsDisabledForDevice) {
			return false;
		}

		if (settings.value.isPageDisabled) {
			return false;
		}

		return true;
	});

	const c = shallowReadonly({
		adapter,
		takeoverAdapter,
		routeResolved,
		ads,
		pageSettings,
		settings,
		shouldShow,
	});
	provide(AdStoreKey, c);

	if (areAdsDisabledForDevice) {
		return c;
	}

	// We set up events so that we know when a route begins and when the
	// routing is fully resolved.
	const beforeDeregister = useRouter().beforeEach((to, from, next) => {
		// Make sure we only update if the route actually changed,
		// since this gets called even if just a simple hash has
		// changed.
		if (_didRouteChange(from, to)) {
			adapter.onBeforeRouteChange();
			if (adapter !== takeoverAdapter) {
				takeoverAdapter.onBeforeRouteChange();
			}
			routeResolved.value = false;
		}
		next();
	});

	const routeAfter$ = onRouteChangeAfter.subscribe(() => {
		if (routeResolved.value) {
			return;
		}

		routeResolved.value = true;
		adapter.onRouteChanged();
		if (adapter !== takeoverAdapter) {
			takeoverAdapter.onRouteChanged();
		}
		_displayAds(Array.from(ads.value));
	});

	onUnmounted(() => {
		beforeDeregister();
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

export function useAdStore() {
	return inject(AdStoreKey)!;
}

export function setPageAdsSettings({ pageSettings }: AdStore, container: AdSettingsContainer) {
	pageSettings.value = container;
}

export function releasePageAdsSettings({ pageSettings }: AdStore) {
	pageSettings.value = null;
}

export function addAd(c: AdStore, ad: AdInterface) {
	const { ads, routeResolved } = c;
	ads.value.add(ad);

	// If the route already resolved then this ad was mounted after the
	// fact. We have to call the initial display.
	if (routeResolved.value) {
		_displayAds([ad]);
	}
}

export function removeAd({ ads }: AdStore, ad: AdInterface) {
	ads.value.delete(ad);
}

async function _displayAds(displayedAds: AdInterface[]) {
	for (const ad of displayedAds) {
		ad.display();
	}
}
