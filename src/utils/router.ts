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
import { routeError404 } from '../_common/error/page/404.route';
import { Navigate, logger as navigateLogger } from '../_common/navigate/navigate.service';
import { initScrollBehavior } from '../_common/scroll/auto-scroll/autoscroll.service';
import { escapeRegex } from './string';

const ClientBaseRegex = new RegExp(
	escapeRegex(Environment.baseUrlDesktopApp) + '\\/([^.]+)\\.html#'
);

/**
 * @__NO_SIDE_EFFECTS__
 */
export function initRouter(appRoutes: RouteRecordRaw[]) {
	const routes = [...appRoutes, routeError404];

	let history: RouterHistory;
	if (GJ_IS_DESKTOP_APP && GJ_BUILD_TYPE !== 'serve-hmr') {
		history = createWebHashHistory();
	} else if (import.meta.env.SSR) {
		history = createMemoryHistory();
	} else {
		history = createWebHistory();
	}

	const router = createRouter({
		history,
		routes,
		scrollBehavior: initScrollBehavior(),
	});

	router.beforeEach(to => {
		const logInfo: Record<string, any> = {
			Name: to.name,
			Path: to.path,
			Params: to.params,
			Query: to.query,
		};

		if ('href' in to) {
			logInfo.Href = (to as any).href;
		}

		const logInfoStr = Object.keys(logInfo)
			.map(k => `${k}: ${JSON.stringify(logInfo[k])}`)
			.join('\n\t');

		navigateLogger.info(`Router going to ${to.fullPath}. Route:\n\t${logInfoStr}`);
	});

	return router;
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

	function handleClick(e: MouseEvent) {
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
		// TODO(desktop-app-fixes) would that ever work for client? how?.. the base url for the router is wrong isnt it??
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
				// TODO(desktop-app-fixes) is this outdated? how do we check?
				const nonClientPaths = [
					/^\/gas(\/.*)?/,
					/^\/api(\/.*)?/,
					/^\/developers(\/.*)?/,
					/^\/claim(\/.*)?/,
				];

				const browsable = nonClientPaths.every(i => i.test(href) === false);
				if (browsable) {
					// TODO(desktop-app-fixes) This assumes all these urls are on the app section. isnt this wrong?
					//
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
	}

	document.body.addEventListener('click', handleClick);

	// auxclick is middle mouse button. We only want to hijack this stuff in
	// desktop app since it creates its own weird secondary window.
	if (GJ_IS_DESKTOP_APP) {
		document.body.addEventListener('auxclick', handleClick);
	}
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
	// button 1 is the middle click
	if (ke.metaKey || ke.altKey || ke.ctrlKey || ke.shiftKey || me.button === 1) {
		// If in client, we should pop open a new window. Gotta make sure that
		// if it's a client-relative link, we need to replace with the correct
		// host.
		if (GJ_IS_DESKTOP_APP) {
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
			// Client doesn't handle target="_blank" correctly.
			if (GJ_IS_DESKTOP_APP) {
				return 'window';
			}

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
}

/**
 * @__NO_SIDE_EFFECTS__
 */
export function locationRedirectFromRoute(
	from: RouteLocationNormalized,
	params: any,
	query: any = {}
) {
	return new RouteLocationRedirect({
		name: from.name ?? undefined,
		params: Object.assign({}, from.params, params),
		query: Object.assign({}, from.query, query),
		hash: from.hash,
		replace: true,
	});
}

/**
 * @__NO_SIDE_EFFECTS__
 */
export function enforceLocation(route: RouteLocationNormalized, params: any, query: any = {}) {
	for (const key in params) {
		if (route.params[key] !== params[key]) {
			return locationRedirectFromRoute(route, params, query);
		}
	}

	for (const key in query) {
		if (route.query[key] !== query[key]) {
			return locationRedirectFromRoute(route, params, query);
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
 *
 * @__NO_SIDE_EFFECTS__
 */
export function getAbsoluteLink(router: Router, location: RouteLocationRaw) {
	let url = typeof location === 'string' ? location : router.resolve(location).href;
	url = url.replace(/^#/, '');

	return Environment.baseUrl + url;
}

/**
 * Returns true if the given `router` can resolve the given `location` to a
 * known route.
 *
 * This function assumes that the given router has a catch-all route as a
 * fallback that's called 'error.404'. As of time of writing, this is true for
 * all sections - this is done during src/utils/router.ts:initRouter
 *
 * @__NO_SIDE_EFFECTS__
 */
export function isKnownRoute(router: Router, location: string) {
	const resolved = router.resolve(location);

	// Unknown routes should match our fallback route name.
	if ('name' in resolved) {
		return resolved.name !== 'error.404';
	}

	return false;
}

/**
 * Returns a query parameter from a route as either a string or null. If the
 * query was in an array format, it will try pulling the first item.
 *
 * @__NO_SIDE_EFFECTS__
 */
export function getQuery(route: RouteLocationNormalized, key: string) {
	return _getRouteParamString(route.query[key]);
}

/**
 * Returns a route parameter as either a string or null. If the param was in an
 * array format, it will try pulling the first item.
 *
 * @__NO_SIDE_EFFECTS__
 */
export function getParam(route: RouteLocationNormalized, key: string) {
	return _getRouteParamString(route.params[key]);
}

/**
 * @__NO_SIDE_EFFECTS__
 */
function _getRouteParamString(val: string | null | (string | null)[]) {
	if (!val) {
		return null;
	}

	if (Array.isArray(val)) {
		return val[0] ?? null;
	}

	return val ?? null;
}
