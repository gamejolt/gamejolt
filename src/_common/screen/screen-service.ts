import { Subject } from 'rxjs/Subject';
import { fromEvent } from 'rxjs/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';
import { makeObservableService } from '../../utils/vue';

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

export class Screen {
	/**
	 * The actual width of the browser/screen context.
	 * Either in actual pixels, or device pixels if we can.
	 */
	static width = 0;
	static windowWidth = 0;

	/**
	 * The actual height of the browser/screen context.
	 * Either in actual pixels, or device pixels if we can.
	 */
	static height = 0;
	static windowHeight = 0;

	/**
	 * The breakpoint states.
	 */
	static isXs = false;
	static isSm = false;
	static isMd = false;
	static isLg = true; // lg is the default true state.
	static breakpoint: 'xs' | 'sm' | 'md' | 'lg' = 'lg';

	static isWindowXs = Screen.isXs;
	static isWindowSm = Screen.isSm;
	static isWindowMd = Screen.isMd;
	static isWindowLg = Screen.isLg;
	static windowBreakpoint: 'xs' | 'sm' | 'md' | 'lg' = 'lg';

	/**
	 * Just some silly helpers.
	 */
	static isMobile = false;
	static isDesktop = true; // Desktop is default true state.

	static isWindowMobile = Screen.isMobile;
	static isWindowDesktop = Screen.isDesktop;

	/**
	 * The context that the Screen's dimensions are based on.
	 * If null we will just copy over the values of the "window" variants.
	 */
	static context: HTMLElement | null = null;

	/**
	 * If it's Retina/HiDPI or not.
	 */
	static isHiDpi = GJ_IS_SSR
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

	/**
	 * Whether or now the window is being scrolled. Gets updated by the Scroll service.
	 */
	static isScrolling = false;

	static resizeChanges = new Subject<void>();

	/**
	 * Simply recalculates the breakpoint checks.
	 * Shouldn't need to call this often.
	 */
	static recalculate() {
		this._onResize();
	}

	static async _onResize() {
		// Get everything for the window first.
		if (window.matchMedia('only screen and (max-width: ' + (SM_WIDTH - 1) + 'px)').matches) {
			this.isWindowXs = true;
			this.isWindowSm = false;
			this.isWindowMd = false;
			this.isWindowLg = false;
			this.windowBreakpoint = 'xs';
		} else if (
			window.matchMedia(
				'only screen and (min-width: ' +
					SM_WIDTH +
					'px) and (max-width: ' +
					(MD_WIDTH - 1) +
					'px)'
			).matches
		) {
			this.isWindowXs = false;
			this.isWindowSm = true;
			this.isWindowMd = false;
			this.isWindowLg = false;
			this.windowBreakpoint = 'sm';
		} else if (
			window.matchMedia(
				'only screen and (min-width: ' +
					MD_WIDTH +
					'px) and (max-width: ' +
					(LG_WIDTH - 1) +
					'px)'
			).matches
		) {
			this.isWindowXs = false;
			this.isWindowSm = false;
			this.isWindowMd = true;
			this.isWindowLg = false;
			this.windowBreakpoint = 'md';
		} else if (window.matchMedia('only screen and (min-width: ' + LG_WIDTH + 'px)').matches) {
			this.isWindowXs = false;
			this.isWindowSm = false;
			this.isWindowMd = false;
			this.isWindowLg = true;
			this.windowBreakpoint = 'lg';
		}

		if (this.isWindowXs || this.isWindowSm) {
			this.isWindowMobile = true;
			this.isWindowDesktop = false;
		} else {
			this.isWindowMobile = false;
			this.isWindowDesktop = true;
		}

		this.windowWidth = window.innerWidth > 0 ? window.innerWidth : (window as any)['width'];
		this.windowHeight = window.innerHeight > 0 ? window.innerHeight : (window as any)['height'];

		// Now if we have a Screen context set, let's get settings for that.
		// Othwerise we simply use the $indow dimensions.
		if (!this.context) {
			this.isXs = this.isWindowXs;
			this.isSm = this.isWindowSm;
			this.isMd = this.isWindowMd;
			this.isLg = this.isWindowLg;
			this.isMobile = this.isWindowMobile;
			this.isDesktop = this.isWindowDesktop;
			this.width = this.windowWidth;
			this.height = this.windowHeight;
			this.breakpoint = this.windowBreakpoint;
		} else {
			// Pull dimensions from the Screen context.
			// Not sure if media queries include the scrollbar in calculation or not.
			// inner dimensions seem to not take into account any scrollbars.
			this.width = this.context.clientWidth;
			this.height = this.context.clientHeight;

			if (this.width < SM_WIDTH) {
				this.isXs = true;
				this.isSm = false;
				this.isMd = false;
				this.isLg = false;
				this.breakpoint = 'xs';
			} else if (this.width >= SM_WIDTH && this.width < MD_WIDTH) {
				this.isXs = false;
				this.isSm = true;
				this.isMd = false;
				this.isLg = false;
				this.breakpoint = 'sm';
			} else if (this.width >= MD_WIDTH && this.width < LG_WIDTH) {
				this.isXs = false;
				this.isSm = false;
				this.isMd = true;
				this.isLg = false;
				this.breakpoint = 'md';
			} else if (this.width >= LG_WIDTH) {
				this.isXs = false;
				this.isSm = false;
				this.isMd = false;
				this.isLg = true;
				this.breakpoint = 'lg';
			}

			if (this.isXs || this.isSm) {
				this.isMobile = true;
				this.isDesktop = false;
			} else {
				this.isMobile = false;
				this.isDesktop = true;
			}
		}

		// Emit every time we resize.
		this.resizeChanges.next();
	}
}

makeObservableService(Screen);

if (!GJ_IS_SSR) {
	// Check the breakpoints on app load.
	Screen._onResize();

	/**
	 * This is used internally to check things every time window resizes.
	 * We debounce this and afterwards fire the resizeChanges for everyone else.
	 */
	fromEvent(window, 'resize')
		.debounceTime(250)
		.subscribe(() => Screen._onResize());
}
