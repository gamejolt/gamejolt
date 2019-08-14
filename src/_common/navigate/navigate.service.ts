import VueRouter from 'vue-router';
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

	static init(router: VueRouter) {
		this.router = router;
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

	static newWindow(url: string) {
		if (GJ_IS_CLIENT) {
			Navigate.gotoExternal(url);
		} else {
			window.open(url, '_blank');
		}
	}
}
