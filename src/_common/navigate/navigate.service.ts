import {
	AuthBaseUrl,
	CheckoutBaseUrl,
	ClientSectionUrl,
	WttfBaseUrl,
} from '~common/environment/environment.service';
import { defineIsolatedState } from '~common/ssr/isolated-state';
import { createLogger } from '~utils/logging';

export type DestructorFunc = (href?: string) => void;

export const logger = createLogger('Navigate');

const _state = defineIsolatedState(() => ({
	redirecting: false,
	destructors: [] as DestructorFunc[],
}));

function _callDestructors(href?: string) {
	const state = _state();
	while (state.destructors.length > 0) {
		const destructor = state.destructors.shift();
		if (destructor) {
			destructor(href);
		}
	}
}

export const Navigate = {
	get isRedirecting() {
		return _state().redirecting;
	},

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

		if (window.location.href.startsWith(WttfBaseUrl)) {
			return 'app';
		} else if (window.location.href.startsWith(AuthBaseUrl)) {
			return 'auth';
		} else if (window.location.href.startsWith(CheckoutBaseUrl)) {
			return 'checkout';
		} else if (window.location.href.startsWith(ClientSectionUrl)) {
			return 'client';
		}

		return null;
	},

	registerDestructor(destructor: DestructorFunc) {
		if (import.meta.env.SSR) {
			return;
		}
		_state().destructors.push(destructor);
	},

	reload() {
		if (import.meta.env.SSR) {
			return;
		}

		logger.info('Reloading');
		_state().redirecting = true;

		_callDestructors();

		if (GJ_IS_DESKTOP_APP) {
			nw.Window.get().reload();
		} else {
			window.location.reload();
		}
	},

	goto(href: string) {
		if (import.meta.env.SSR) {
			return;
		}

		logger.info('Going to ' + href);

		_state().redirecting = true;

		_callDestructors(href);
		window.location.href = href;
	},

	gotoExternal(href: string) {
		logger.info('Going to in a new tab ' + href);

		if (GJ_IS_DESKTOP_APP) {
			nw.Shell.openExternal(href);
		} else {
			Navigate.goto(href);
		}
	},

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
	},
};
