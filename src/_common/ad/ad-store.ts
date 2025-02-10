import {
	inject,
	InjectionKey,
	onUnmounted,
	provide,
	ref,
	shallowReadonly,
	shallowRef,
	toRef,
} from 'vue';
import { RouteLocationNormalized, useRouter } from 'vue-router';
import { objectEquals } from '../../utils/object';
import { loadScript } from '../../utils/utils';
import { isDynamicGoogleBot } from '../device/device.service';
import { Model } from '../model/model.service';
import { onRouteChangeAfter } from '../route/route-component';
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
 * Whether or not we're showing GPT takeover ads.
 */
export const AdsGPTEnabledGlobally = true;
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

	const properAdapter = new AdProperAdapter();
	const gptAdapter = new AdGptAdapter();

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

	const hasTakeover = ref(false);
	const videoAdsLoadPromise = shallowRef<Promise<void> | null>(null);
	const videoAdsLoaded = ref(false);

	const c = shallowReadonly({
		properAdapter,
		gptAdapter,
		routeResolved,
		ads,
		pageSettings,
		settings,
		shouldShow,
		hasTakeover,
		videoAdsLoadPromise,
		videoAdsLoaded,
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
			properAdapter.onBeforeRouteChange();
			gptAdapter.onBeforeRouteChange();
			routeResolved.value = false;
		}
		next();
	});

	const routeAfter$ = onRouteChangeAfter.subscribe(() => {
		if (routeResolved.value) {
			return;
		}

		routeResolved.value = true;
		properAdapter.onRouteChanged();
		gptAdapter.onRouteChanged();
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
