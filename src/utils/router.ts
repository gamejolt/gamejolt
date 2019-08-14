import Vue from 'vue';
import VueRouter, { RouteConfig, Route, Location } from 'vue-router';

import { routeError404, RouteError404 } from '../components/error/page/page.route';
import { initScrollBehavior } from '../components/scroll/auto-scroll/autoscroll.service';
import { Environment } from '../components/environment/environment.service';
import { Navigate } from '../components/navigate/navigate.service';

const ClientBaseRegex = new RegExp('chrome-extension:\\/\\/game\\-jolt\\-client\\/([^.]+)\\.html#');

export function initRouter(appRoutes: RouteConfig[]) {
	Vue.use(VueRouter);

	const routes = [...appRoutes, routeError404];

	return new VueRouter({
		mode: !GJ_IS_CLIENT ? 'history' : 'hash',
		routes,
		scrollBehavior: initScrollBehavior(),
	});
}

/**
 * In order for vue-router to capture the clicks and switch routes, every link
 * must be done inside a router-link element. This captures A tags that may not
 * be in router-link and tries to route them if it points to a correct route.
 */
export function hijackLinks(router: VueRouter, host: string) {
	if (GJ_IS_SSR) {
		return;
	}

	document.body.addEventListener('click', e => {
		// Should we handle this event?
		const guard = guardHijackEvent(e);
		if (guard === 'passthrough') {
			return;
		}

		// Try to find an A tag.
		let target = e.target as HTMLAnchorElement;
		if (!(target instanceof HTMLElement)) {
			return;
		}

		while (target.nodeName.toLowerCase() !== 'a') {
			// Immediately stop if we hit the end.
			if ((target as any) === document || !target.parentNode) {
				return;
			}
			target = target.parentNode as HTMLAnchorElement;
		}

		let href = target.href;
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
		const matched = router.getMatchedComponents(href);
		if (matched.length > 0 && matched[0] !== RouteError404) {
			// We matched a route! Let's go to it and stop the browser from doing
			// anything with the link click.
			e.preventDefault();
			router.push(href);
			return;
		}

		if (GJ_IS_CLIENT) {
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
function guardHijackEvent(e: any): 'passthrough' | 'window' | 'handle' {
	const ke = e as KeyboardEvent;
	const me = e as MouseEvent;

	// don't redirect when preventDefault called
	if (e.defaultPrevented) {
		return 'passthrough';
	}

	// don't redirect with control keys
	if (ke.metaKey || ke.altKey || ke.ctrlKey || ke.shiftKey) {
		if (GJ_IS_CLIENT) {
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
	if (e.currentTarget && e.currentTarget.getAttribute) {
		const target = e.currentTarget.getAttribute('target');
		if (/\b_blank\b/i.test(target)) {
			// Client handles target="_blank" correctly.
			return 'passthrough';
		}
	}

	return 'handle';
}

function newWindow(e: Event, url: string) {
	if (GJ_IS_CLIENT) {
		Navigate.gotoExternal(url);
		e.preventDefault();
	} else {
		window.open(url, '_blank');
	}
}

export class LocationRedirect {
	constructor(public location: Location) {}

	static fromRoute(from: Route, params: any, query: any = {}) {
		return new LocationRedirect({
			name: from.name,
			params: Object.assign({}, from.params, params),
			query: Object.assign({}, from.query, query),
			hash: from.hash,
			replace: true,
		});
	}
}

export function enforceLocation(route: Route, params: any, query: any = {}) {
	for (const key in params) {
		if (route.params[key] !== params[key]) {
			return LocationRedirect.fromRoute(route, params, query);
		}
	}

	for (const key in query) {
		if (route.query[key] !== query[key]) {
			return LocationRedirect.fromRoute(route, params, query);
		}
	}
}
