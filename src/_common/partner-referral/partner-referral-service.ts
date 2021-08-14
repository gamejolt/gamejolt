import { RouteLocationNormalized } from 'vue-router';

export class PartnerReferral {
	static trackReferrer(resource: string, resourceId: number, route: RouteLocationNormalized) {
		if (GJ_IS_SSR) {
			return;
		}

		const ref = route.query.ref as string;
		if (ref) {
			window.sessionStorage.setItem(`partner-ref:${resource}:${resourceId}`, ref);
		}
	}

	static getReferrer(resource: string, resourceId: number) {
		if (GJ_IS_SSR) {
			return null;
		}

		return window.sessionStorage.getItem(`partner-ref:${resource}:${resourceId}`);
	}
}
