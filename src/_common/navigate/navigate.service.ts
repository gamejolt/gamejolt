import { createLogger } from '../../utils/logging';
import { Environment } from '../environment/environment.service';

export type DestructorFunc = (href?: string) => void;

export const logger = createLogger('Navigate');

class NavigateService {
	private redirecting = false;
	private destructors: DestructorFunc[] = [];

	get isRedirecting() {
		return this.redirecting;
	}

	/**
	 * Only usable in client.
	 */
	get currentClientSection() {
		if (!GJ_IS_DESKTOP_APP) {
			throw new Error('Attempted to use Navigate.currentClientSection outside of client');
		}

		// At the time of writing, when serving the client with HMR we only
		// support watching one section at a time, and its not always possible
		// to infer the section purely from the url. A bit ugly but this works
		// for now.
		if (GJ_BUILD_TYPE === 'serve-hmr') {
			return GJ_SECTION;
		}

		if (window.location.href.startsWith(Environment.wttfBaseUrl)) {
			return 'app';
		} else if (window.location.href.startsWith(Environment.authBaseUrl)) {
			return 'auth';
		} else if (window.location.href.startsWith(Environment.checkoutBaseUrl)) {
			return 'checkout';
		} else if (window.location.href.startsWith(Environment.clientSectionUrl)) {
			return 'client';
		}

		return null;
	}

	private callDestructors(href?: string) {
		while (this.destructors.length > 0) {
			const destructor = this.destructors.shift();
			if (destructor) {
				destructor(href);
			}
		}
	}

	registerDestructor(destructor: DestructorFunc) {
		this.destructors.push(destructor);
	}

	reload() {
		logger.info('Reloading');
		this.redirecting = true;

		this.callDestructors();

		if (GJ_IS_DESKTOP_APP) {
			nw.Window.get().reload();
		} else {
			window.location.reload();
		}
	}

	public goto(href: string) {
		logger.info('Going to ' + href);

		this.redirecting = true;

		this.callDestructors(href);
		window.location.href = href;
	}

	gotoExternal(href: string) {
		logger.info('Going to in a new tab ' + href);

		if (GJ_IS_DESKTOP_APP) {
			nw.Shell.openExternal(href);
		} else {
			this.goto(href);
		}
	}

	newWindow(
		url: string,
		/**
		 * Including this will attempt to open as a new window instead of a new
		 * tab. Pass an empty object to use the defaults.
		 *
		 * - `heightFactor = 0.5`
		 * - `widthFactor = 0.5`
		 * - `center = true`
		 *
		 * Absolute width and height will override the width/height factors if
		 * passed in.
		 */
		windowOptions?: {
			width?: number;
			height?: number;
			widthFactor?: number;
			heightFactor?: number;
			center?: boolean;
		}
	) {
		logger.info('Going to in a new window ' + url);

		if (GJ_IS_DESKTOP_APP) {
			Navigate.gotoExternal(url);
		} else if (!windowOptions) {
			window.open(url, '_blank');
		} else {
			let { width, height } = windowOptions;
			const { widthFactor = 0.5, heightFactor = 0.5, center = true } = windowOptions;

			if (!width) {
				width = Math.round(screen.width * widthFactor);
			}
			if (!height) {
				height = Math.round(screen.height * heightFactor);
			}

			width = Math.min(screen.width, Math.max(100, width));
			height = Math.min(screen.height, Math.max(100, height));
			const options = [`width=${width}`, `height=${height}`];

			if (center) {
				const left = Math.max(0, (screen.width - width) / 2);
				const top = Math.max(0, (screen.height - height) / 2);
				options.push(`left=${left}`);
				options.push(`top=${top}`);
			}

			window.open(url, '_blank', options.join(','));
		}
	}
}

export const Navigate = /** @__PURE__ */ new NavigateService();
