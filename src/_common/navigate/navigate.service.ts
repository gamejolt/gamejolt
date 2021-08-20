import { Environment } from '../environment/environment.service';

export type DestructorFunc = (href?: string) => void;

export class Navigate {
	private static redirecting = false;
	private static destructors: DestructorFunc[] = [];

	static get isRedirecting() {
		return this.redirecting;
	}

	/**
	 * Only usable in client.
	 */
	static get currentClientSection() {
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

	private static callDestructors(href?: string) {
		while (this.destructors.length > 0) {
			const destructor = this.destructors.shift();
			if (destructor) {
				destructor(href);
			}
		}
	}

	static registerDestructor(destructor: DestructorFunc) {
		this.destructors.push(destructor);
	}

	static reload() {
		this.redirecting = true;

		this.callDestructors();

		if (GJ_IS_CLIENT) {
			nw.Window.get().reload();
		} else {
			window.location.reload();
		}
	}

	public static goto(href: string) {
		this.redirecting = true;

		this.callDestructors(href);
		window.location.href = href;
	}

	static gotoExternal(href: string) {
		if (GJ_IS_CLIENT) {
			nw.Shell.openExternal(href);
		} else {
			this.goto(href);
		}
	}

	static newWindow(
		url: string,
		/**
		 * Including this will attempt to open as a new window instead of a new
		 * tab. Pass an empty object to use the defaults.
		 *
		 * - `heightFactor = 0.5`
		 * - `widthFactor = 0.5`
		 * - `center = true`
		 */
		externalParams?: {
			widthFactor?: number;
			heightFactor?: number;
			center?: boolean;
		}
	) {
		if (GJ_IS_CLIENT) {
			Navigate.gotoExternal(url);
		} else if (!externalParams) {
			window.open(url, '_blank');
		} else {
			const { widthFactor = 0.5, heightFactor = 0.5, center = true } = externalParams;
			let width = Math.round(screen.width * widthFactor);
			let height = Math.round(screen.height * heightFactor);
			width = Math.min(screen.width, Math.max(100, width));
			height = Math.min(screen.height, Math.max(100, height));
			let options = `width=${width},height=${height}`;

			if (center) {
				const left = Math.max(0, (screen.width - width) / 2);
				const top = Math.max(0, (screen.height - height) / 2);
				options += `,left=${left},top=${top}`;
			}

			window.open(url, '', options);
		}
	}
}
