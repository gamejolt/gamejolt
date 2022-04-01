import {
	createMemoryHistory,
	createRouter,
	createWebHashHistory,
	createWebHistory,
	RouteLocationNormalized,
	RouteLocationRaw,
	Router,
	RouteRecordRaw,
	RouterHistory,
} from 'vue-router';
import { Environment } from '../_common/environment/environment.service';
import { routeError404 } from '../_common/error/page/page.route';
import { Navigate } from '../_common/navigate/navigate.service';
import { initScrollBehavior } from '../_common/scroll/auto-scroll/autoscroll.service';

const ClientBaseRegex = new RegExp('chrome-extension:\\/\\/game\\-jolt\\-client\\/([^.]+)\\.html#');

export function initRouter(appRoutes: RouteRecordRaw[]) {
	const routes = [...appRoutes, routeError404];

	let history: RouterHistory;
	if (GJ_IS_DESKTOP_APP && !GJ_IS_WATCHING) {
		history = createWebHashHistory();
	} else if (import.meta.env.SSR) {
		history = createMemoryHistory();
	} else {
		history = createWebHistory();
	}

	return createRouter({
		history,
		routes,
		scrollBehavior: initScrollBehavior(),
	});
}

/**
 * In order for vue-router to capture the clicks and switch routes, every link
 * must be done inside a router-link element. This captures A tags that may not
 * be in router-link and tries to route them if it points to a correct route.
 */
export function hijackLinks(router: Router, host: string) {
	if (import.meta.env.SSR) {
		return;
	}

	document.body.addEventListener('click', e => {
		let elem: HTMLElement | null = e.target as any;
		while (elem && !(elem instanceof HTMLAnchorElement)) {
			elem = elem?.parentNode as HTMLElement | null;
		}

		if (!elem) {
			return;
		}

		// Should we handle this event?
		const guard = guardHijackEvent(elem, e);
		if (guard === 'passthrough') {
			return;
		}

		let href = elem.href;
		if (!href) {
			return;
		}

		// If client, get rid of the client base and replace it with the main domain.
		href = href.replace(ClientBaseRegex, 'https://' + host);

		// If we are supposed to open this in a new window, let's do that now.
		if (guard === 'window') {
			return newWindow(e, href);
		}

		const original = href;
		const replacements = ['http://' + host, 'https://' + host];
		for (const replacement of replacements) {
			href = href.replace(replacement, '');
		}

		// Now try to match it against our routes and see if we got anything. If
		// we match a 404 it's obviously wrong.
		const { matched } = router.resolve(href);
		if (matched.length > 0 && matched[0].name !== 'error.404') {
			// We matched a route! Let's go to it and stop the browser from doing
			// anything with the link click.
			e.preventDefault();
			router.push(href);
			return;
		}

		if (GJ_IS_DESKTOP_APP) {
			const isGameJoltPath = /^https?:\/\/gamejolt\./.test(href);
			if (isGameJoltPath) {
				const nonClientPaths = [
					/^\/gas(\/.*)?/,
					/^\/api(\/.*)?/,
					/^\/developers(\/.*)?/,
					/^\/claim(\/.*)?/,
				];

				const browsable = nonClientPaths.every(i => i.test(href) === false);
				if (browsable) {
					// Gotta rewrite the URL to include the correct base URL (to include the #).
					// Otherwise it'll try to direct to the URL below as the raw URL.
					Navigate.goto(Environment.wttfBaseUrl + href);
					e.preventDefault();
					return;
				}
			}

			return newWindow(e, original);
		}

		// Let it direct to the URL by doing nothing.
	});
}

// Basically taken from vue-router router-link. Decides if we should do any
// logic against this particular event.
function guardHijackEvent(elem: HTMLElement, e: any): 'passthrough' | 'window' | 'handle' {
	const ke = e as KeyboardEvent;
	const me = e as MouseEvent;

	// don't redirect when preventDefault called
	if (e.defaultPrevented) {
		return 'passthrough';
	}

	// don't redirect with control keys
	if (ke.metaKey || ke.altKey || ke.ctrlKey || ke.shiftKey) {
		if (GJ_IS_DESKTOP_APP) {
			// If in client, we should pop open a new window. Gotta make sure that if it's a
			// client-relative link, we need to replace with the correct host.
			return 'window';
		}

		return 'passthrough';
	}

	// don't redirect on right click
	if (me.button !== undefined && me.button !== 0) {
		return 'passthrough';
	}

	// don't redirect if `target="_blank"`
	if (elem.getAttribute) {
		const target = elem.getAttribute('target');
		if (target && /\b_blank\b/i.test(target)) {
			// Client handles target="_blank" correctly.
			return 'passthrough';
		}
	}

	return 'handle';
}

function newWindow(e: Event, url: string) {
	Navigate.gotoExternal(url);
	if (GJ_IS_DESKTOP_APP) {
		e.preventDefault();
	}
}

/**
 * vue-router doesn't have a type that doesn't include the raw string location.
 * This is a helper to define the route location as an object definition.
 */
export type RouteLocationDefinition = Exclude<RouteLocationRaw, string>;

export class RouteLocationRedirect {
	constructor(public location: RouteLocationDefinition) {}

	static fromRoute(from: RouteLocationNormalized, params: any, query: any = {}) {
		return new RouteLocationRedirect({
			name: from.name ?? undefined,
			params: Object.assign({}, from.params, params),
			query: Object.assign({}, from.query, query),
			hash: from.hash,
			replace: true,
		});
	}
}

export function enforceLocation(route: RouteLocationNormalized, params: any, query: any = {}) {
	for (const key in params) {
		if (route.params[key] !== params[key]) {
			return RouteLocationRedirect.fromRoute(route, params, query);
		}
	}

	for (const key in query) {
		if (route.query[key] !== query[key]) {
			return RouteLocationRedirect.fromRoute(route, params, query);
		}
	}
}

/**
 * Will replace the current route but without the query passed in. Can be used
 * to get rid of query params that were only there to trigger certain things to
 * happen, that you don't want to happen again on refresh.
 */
export function removeQuery(router: Router, key: string) {
	const route = router.currentRoute.value;

	router.replace({
		...route,
		query: {
			...route.query,
			[key]: undefined,
		},
	});
}

/**
 * Will generate a link from a route location.
 */
export function getAbsoluteLink(router: Router, location: RouteLocationRaw) {
	let url = typeof location === 'string' ? location : router.resolve(location).href;
	url = url.replace(/^#/, '');

	return Environment.baseUrl + url;
}

/**
 * Returns a query parameter from a route as either a string or null. If the
 * query was in an array format, it will try pulling the first item.
 */
export function getQuery(route: RouteLocationNormalized, key: string) {
	return _getRouteParamString(route.query[key]);
}

/**
 * Returns a route parameter as either a string or null. If the param was in an
 * array format, it will try pulling the first item.
 */
export function getParam(route: RouteLocationNormalized, key: string) {
	return _getRouteParamString(route.params[key]);
}

function _getRouteParamString(val: string | null | (string | null)[]) {
	if (!val) {
		return null;
	}

	if (Array.isArray(val)) {
		return val[0] ?? null;
	}

	return val ?? null;
}
