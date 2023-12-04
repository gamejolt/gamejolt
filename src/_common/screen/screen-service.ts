import { reactive, ref, toRef } from 'vue';
import { debounce } from '../../utils/utils';
import { getDeviceType } from '../device/device.service';
import { EventTopic } from '../system/event/event-topic';

export const Screen = createScreenService();
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
function createScreenService() {
	const width = ref(0);
	const height = ref(0);

	const isHiDpi = ref(false);
	const isPointerMouse = ref(true);

	const isXs = ref(false);
	const isSm = ref(false);
	const isMd = ref(false);
	// lg is the default fallback.
	const isLg = ref(true);

	const isMobile = toRef(() => isXs.value || isSm.value);
	const isDesktop = toRef(() => !isMobile.value);

	return reactive({
		/**
		 * The actual width of the browser/screen context. Either in actual
		 * pixels, or device pixels if we can.
		 */
		width,
		/**
		 * The actual height of the browser/screen context. Either in actual
		 * pixels, or device pixels if we can.
		 */
		height,
		/**
		 * If it's Retina/HiDPI or not.
		 */
		isHiDpi,
		/**
		 * If they're primary pointer device is a mouse.
		 */
		isPointerMouse,
		isXs,
		isSm,
		isMd,
		isLg,
		/**
		 * If the breakpoint is either xs or sm.
		 */
		isMobile,
		/**
		 * If the breakpoint is md or greater.
		 */
		isDesktop,
	});
}

export function initScreenService() {
	// We use their user agent to initialize our initial breakpoints so that mobile
	// SSR renderers will correctly get the right styling. That is, if they set the
	// user agent correctly.
	const _deviceType = getDeviceType();

	Screen.isPointerMouse = _deviceType !== 'mobile' && _deviceType !== 'tablet';
	Screen.isXs = _deviceType === 'mobile';
	Screen.isSm = _deviceType === 'tablet';
	Screen.isMd = false;
	Screen.isLg = !Screen.isXs && !Screen.isSm && !Screen.isMd;

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
	Screen.width = window.innerWidth > 0 ? window.innerWidth : (window as any)['width'];
	Screen.height = window.innerHeight > 0 ? window.innerHeight : (window as any)['height'];

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
	Screen[field] = match.matches;

	const onChange = (e: MediaQueryListEvent) => (Screen[field] = e.matches);

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
