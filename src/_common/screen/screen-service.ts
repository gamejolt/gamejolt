import { ref, shallowReadonly, toRef } from 'vue';

import { getDeviceType } from '~common/device/device.service';
import { defineIsolatedState } from '~common/ssr/isolated-state';
import { EventTopic } from '~common/system/event/event-topic';
import { debounce } from '~utils/utils';

export const onScreenResize = new EventTopic<void>();

/**
 * Media query breakpoints.
 */
const SM_WIDTH = 768;
const MD_WIDTH = 992;
const LG_WIDTH = 1200;

/**
 * The HiDPI breakpoint.
 * Any resolution above this breakpoint will be considered HiDPI.
 * http://bjango.com/articles/min-device-pixel-ratio/
 */
const HIDPI_BREAKPOINT = 1.5;

/**
 * @__NO_SIDE_EFFECTS__
 */
function createScreenStore() {
	const screenWidth = ref(0);
	const screenHeight = ref(0);

	const isHiDpi = ref(false);
	const isPointerMouse = ref(true);

	const isXs = ref(false);
	const isSm = ref(false);
	const isMd = ref(false);
	// lg is the default fallback.
	const isLg = ref(true);

	const isMobile = toRef(() => isXs.value || isSm.value);
	const isDesktop = toRef(() => !isMobile.value);

	return shallowReadonly({
		screenWidth,
		screenHeight,
		isHiDpi,
		isPointerMouse,
		isXs,
		isSm,
		isMd,
		isLg,
		isMobile,
		isDesktop,
	});
}

export const getScreen = defineIsolatedState(() => createScreenStore());

export function initScreenService() {
	const store = getScreen();

	// We use their user agent to initialize our initial breakpoints so that mobile
	// SSR renderers will correctly get the right styling. That is, if they set the
	// user agent correctly.
	const _deviceType = getDeviceType();

	store.isPointerMouse.value = _deviceType !== 'mobile' && _deviceType !== 'tablet';
	store.isXs.value = _deviceType === 'mobile';
	store.isSm.value = _deviceType === 'tablet';
	store.isMd.value = false;
	store.isLg.value = !store.isXs.value && !store.isSm.value && !store.isMd.value;

	if (!import.meta.env.SSR) {
		_createMediaQueryWatcher(
			'isHiDpi',
			[
				`only screen and (-webkit-min-device-pixel-ratio: ${HIDPI_BREAKPOINT})`,
				`only screen and (min--moz-device-pixel-ratio: ${HIDPI_BREAKPOINT})`,
				`only screen and (-o-min-device-pixel-ratio: ${HIDPI_BREAKPOINT} / 1)`,
				`only screen and (min-resolution: ${HIDPI_BREAKPOINT}dppx)`,
				`only screen and (min-resolution: ${HIDPI_BREAKPOINT} * 96dpi)`,
			].join(',')
		);

		_createMediaQueryWatcher('isPointerMouse', 'not screen and (pointer: coarse)');

		_createMediaQueryWatcher('isXs', `only screen and (max-width: ${SM_WIDTH - 1}px)`);
		_createMediaQueryWatcher(
			'isSm',
			`only screen and (min-width: ${SM_WIDTH}px) and (max-width: ${MD_WIDTH - 1}px)`
		);
		_createMediaQueryWatcher(
			'isMd',
			`only screen and (min-width: ${MD_WIDTH}px) and (max-width: ${LG_WIDTH - 1}px)`
		);
		_createMediaQueryWatcher('isLg', `only screen and (min-width: ${LG_WIDTH}px)`);

		// Trigger on app load for the first time.
		_onResize();

		/**
		 * This is used internally to check things every time window resizes.
		 * We debounce this and afterwards fire the resizeChanges for everyone else.
		 */
		window.addEventListener(
			'resize',
			debounce(() => _onResize(), 250)
		);
	}
}

/**
 * Can be used to tell the Screen service to check sizing again in case things
 * have shifted around without the screen actually resizing.
 */
export function triggerOnScreenResize() {
	_onResize();
}

async function _onResize() {
	const store = getScreen();
	store.screenWidth.value = window.innerWidth > 0 ? window.innerWidth : (window as any)['width'];
	store.screenHeight.value =
		window.innerHeight > 0 ? window.innerHeight : (window as any)['height'];

	// Emit every time we resize.
	onScreenResize.next();
}

/**
 * Will set up a media query listener so that the field will update immediately
 * any time there's a change.
 */
function _createMediaQueryWatcher(
	field: 'isXs' | 'isSm' | 'isMd' | 'isLg' | 'isHiDpi' | 'isPointerMouse',
	mediaQuery: string
) {
	const match = window.matchMedia(mediaQuery);
	getScreen()[field].value = match.matches;

	const onChange = (e: MediaQueryListEvent) => (getScreen()[field].value = e.matches);

	// https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList#browser_compatibility
	//
	// Mobile Safari prior to version 14 doesn't support "addEventListener".
	// Do this or the site will break for old iOS.

	const keys: (keyof typeof match)[] = ['addEventListener', 'addListener'];

	for (const key of keys) {
		try {
			if (key === 'addEventListener') {
				// Use the current standard first if available.
				match[key]('change', onChange);
				break;
			}

			if (key === 'addListener') {
				// Fallback to the deprecated method if available.
				match[key](onChange);
				break;
			}
		} catch (e) {
			console.error(`Error when trying to listen for media query changes.`, e);
		}
	}
}
