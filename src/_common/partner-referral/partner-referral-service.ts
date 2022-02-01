import { RouteLocationNormalized } from 'vue-router';

export class PartnerReferral {
	static trackReferrer(resource: string, resourceId: number, route: RouteLocationNormalized) {
		if (import.meta.env.SSR) {
			return;
		}

		const ref = route.query.ref as string;
		if (ref) {
			window.sessionStorage.setItem(`partner-ref:${resource}:${resourceId}`, ref);
		}
	}

	static getReferrer(resource: string, resourceId: number) {
		if (import.meta.env.SSR) {
			return null;
		}

		return window.sessionStorage.getItem(`partner-ref:${resource}:${resourceId}`);
	}
}
