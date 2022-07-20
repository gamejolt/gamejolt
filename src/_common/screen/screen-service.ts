import { reactive } from '@vue/reactivity';
import { debounce, run } from '../../utils/utils';
import { EventTopic } from '../system/event/event-topic';

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

export const onScreenResize = new EventTopic<void>();

class ScreenService {
	/**
	 * The actual width of the browser/screen context. Either in actual pixels,
	 * or device pixels if we can.
	 */
	width = 0;

	/**
	 * The actual height of the browser/screen context. Either in actual pixels,
	 * or device pixels if we can.
	 */
	height = 0;

	isXs = false;
	isSm = false;
	isMd = false;
	/**
	 * lg is the default true state.
	 */
	isLg = true;

	get breakpoint() {
		return this.isXs ? 'xs' : this.isSm ? 'sm' : this.isMd ? 'md' : 'lg';
	}

	get isMobile() {
		return this.isXs || this.isSm;
	}

	get isDesktop() {
		return !this.isMobile;
	}

	/**
	 * If it's Retina/HiDPI or not.
	 */
	isHiDpi = import.meta.env.SSR
		? false
		: window.matchMedia(
				'only screen and (-webkit-min-device-pixel-ratio: ' +
					HIDPI_BREAKPOINT +
					')' +
					', only screen and (min--moz-device-pixel-ratio: ' +
					HIDPI_BREAKPOINT +
					')' +
					', only screen and (-o-min-device-pixel-ratio: ' +
					HIDPI_BREAKPOINT +
					' / 1)' +
					', only screen and (min-resolution: ' +
					HIDPI_BREAKPOINT +
					'dppx)' +
					', only screen and (min-resolution: ' +
					HIDPI_BREAKPOINT * 96 +
					'dpi)'
		  ).matches;

	isPointerMouse = import.meta.env.SSR
		? true
		: run(() => {
				const match = window.matchMedia('not screen and (pointer: coarse)');
				match.addEventListener('change', e => (Screen.isPointerMouse = e.matches));
				return match.matches;
		  });
}

export const Screen = reactive(new ScreenService()) as ScreenService;

if (!import.meta.env.SSR) {
	// Check the breakpoints on app load.
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

async function _onResize() {
	Screen.isXs = false;
	Screen.isSm = false;
	Screen.isMd = false;
	Screen.isLg = false;

	// Get everything for the window first.
	if (window.matchMedia('only screen and (max-width: ' + (SM_WIDTH - 1) + 'px)').matches) {
		Screen.isXs = true;
	} else if (
		window.matchMedia(
			'only screen and (min-width: ' +
				SM_WIDTH +
				'px) and (max-width: ' +
				(MD_WIDTH - 1) +
				'px)'
		).matches
	) {
		Screen.isSm = true;
	} else if (
		window.matchMedia(
			'only screen and (min-width: ' +
				MD_WIDTH +
				'px) and (max-width: ' +
				(LG_WIDTH - 1) +
				'px)'
		).matches
	) {
		Screen.isMd = true;
	} else if (window.matchMedia('only screen and (min-width: ' + LG_WIDTH + 'px)').matches) {
		Screen.isLg = true;
	}

	Screen.width = window.innerWidth > 0 ? window.innerWidth : (window as any)['width'];
	Screen.height = window.innerHeight > 0 ? window.innerHeight : (window as any)['height'];

	// Emit every time we resize.
	onScreenResize.next();
}

/**
 * Can be used to tell the Screen service to check sizing again in case things
 * have shifted around without the screen actually resizing.
 */
export function triggerOnScreenResize() {
	_onResize();
}
