import { ComponentOptions, MaybeRef, getCurrentInstance, onUnmounted, ref, watch } from 'vue';
import { NavigationGuardWithThis, RouteLocationNormalized, Router, useRouter } from 'vue-router';
import { RouteLocationRedirect } from '../../utils/router';
import { ensureConfig } from '../config/config.service';
import { HistoryCache } from '../history/cache/cache.service';
import { Meta, setMetaTitle } from '../meta/meta-service';
import { Navigate } from '../navigate/navigate.service';
import { PayloadError, PayloadErrorType } from '../payload/payload-service';
import { useCommonStore } from '../store/common-store';
import { EventTopic } from '../system/event/event-topic';

export type AppRoute = ReturnType<typeof createAppRoute>;

interface ReloadOnParams {
	params: string[];
	query?: string[];
}
interface ReloadOnQuery {
	params?: string[];
	query: string[];
}
type ReloadOnDeps = Required<ReloadOnParams & ReloadOnQuery>;
type ReloadOnPreset = 'always' | 'never';

export interface AppRouteOptions {
	lazy?: boolean;
	cache?: boolean;
	reloadOn: ReloadOnPreset | ReloadOnParams | ReloadOnQuery | ReloadOnDeps;
	resolver?: (data: { route: RouteLocationNormalized }) => Promise<any>;
}

export type AppRouteOptionsInternal = AppRouteOptions & {
	key: symbol;
};

/**
 * Subscribe to know when the route has finished changing.
 */
export const onRouteChangeAfter = new EventTopic<void>();

/**
 * @__NO_SIDE_EFFECTS__
 */
export function defineAppRouteOptions(options: AppRouteOptions): {
	appRouteOptions: AppRouteOptionsInternal;
	beforeRouteEnter: NavigationGuardWithThis<undefined>;
} {
	const key = Symbol();
	const appRouteOptions = { ...options, key };

	return {
		appRouteOptions,
		async beforeRouteEnter(to, _from) {
			// The router crawls through each matched route and calls
			// beforeRouteEnter on them one by one. Since we continue to set the
			// leaf route the last one is the only one that will be saved as the
			// leaf.
			setLeafRoute(key);

			if (!appRouteOptions.resolver) {
				return;
			}

			const hasCache = appRouteOptions.cache ? HistoryCache.has(to, key) : false;

			if (appRouteOptions.lazy && !hasCache && !import.meta.env.SSR) {
				const resolver = new Resolver(appRouteOptions, to, {
					useCache: false,
				});

				// In this case we want to resolve lazily. The setup() hook of the
				// component will pick up the Resolver and finish out resolving it.
				resolver.resolvePayload();
			} else {
				const resolver = new Resolver(appRouteOptions, to, {
					useCache: !!appRouteOptions.cache,
				});

				// In this case we want to make sure we resolve the payload
				// before resolving the route so that the data is set
				// immediately. The setup() hook of the component will see
				// that this Resolver is already resolved and immediately
				// resolve the route with this data.
				await resolver.resolvePayload().catch(e => console.log(e));
			}
		},
	};
}

export function createAppRoute({
	onInit,
	onResolved,
	onDestroyed,
	...options
}: {
	routeTitle?: MaybeRef<string | null>;
	disableTitleSuffix?: MaybeRef<boolean>;

	/**
	 * Called to initialize the route either at the first route to this
	 * component or after the $route object changes with params.
	 */
	onInit?: (this: void) => void;

	/**
	 * Called after the resolver resolves with data.
	 */
	onResolved?: (this: void, options: { payload: any; fromCache: boolean }) => void;

	/**
	 * Called when the route component is completely destroyed.
	 */
	onDestroyed?: (this: void) => void;
}) {
	const { setError, redirect } = useCommonStore();
	const router = useRouter();
	const instance = getCurrentInstance()!;
	const resolverOptions = (instance.type as ComponentOptions).appRouteOptions!;

	if (!resolverOptions) {
		throw new Error(
			`Route component must be wrapped in defineRouteComponent() for ${instance.type.name}.`
		);
	}

	const { key: routeKey } = resolverOptions;

	const isDestroyed = ref(false);
	const isLoading = ref(false);
	const isBootstrapped = ref(false);
	const disableTitleSuffix = ref(options.disableTitleSuffix ?? false);
	const routeTitle = ref(options.routeTitle);

	onInit?.();

	watch(
		router.currentRoute,
		(to, from) => {
			_onRouteChange(to, from);
		},
		{ flush: 'post' }
	);

	watch(
		[routeTitle, disableTitleSuffix],
		([routeTitle, disableTitleSuffix]) => {
			if (routeTitle !== undefined) {
				setMetaTitle(routeTitle, disableTitleSuffix);
			}
		},
		{ immediate: true }
	);

	const activeResolver = _activeRouteResolvers.get(routeKey);
	if (activeResolver) {
		// If we were resolving lazily, let's finalize it.
		if (!activeResolver.isResolved) {
			isLoading.value = true;
			activeResolver.resolvePayload().then(() => _resolveRoute(activeResolver));
		} else {
			_resolveRoute(activeResolver);
		}
	}
	// For routes with a resolver defined, there should always be an active
	// resolver when we get here. If there isn't, then this was probably v-ifed
	// out of the tree and then put in dynamically. We have to manually trigger
	// the resolve from the beginning in this case.
	else {
		if (resolverOptions.resolver) {
			_doReload({ useCache: !!resolverOptions.cache });
		}
	}

	onUnmounted(() => {
		isDestroyed.value = true;
		onDestroyed?.();
	});

	function reload() {
		_doReload({ useCache: false });
	}

	async function _onRouteChange(to: RouteLocationNormalized, from: RouteLocationNormalized) {
		// Only do work if the route params/query has actually changed.
		if (_canSkipRouteUpdate(resolverOptions, from, to)) {
			return;
		}

		await _doReload({ route: to, useCache: !!resolverOptions.cache });
	}

	async function _doReload({
		route,
		useCache = true,
	}: {
		route?: RouteLocationNormalized;
		useCache?: boolean;
	}) {
		route ??= router.currentRoute.value;

		onInit?.();

		if (resolverOptions.resolver) {
			isLoading.value = true;

			const resolver = new Resolver(resolverOptions, route, {
				useCache,

				// On payload resolution, we want to immediately call our
				// resolveRoute function with the data. This allows cached calls
				// to resolve before the next async tick.
				onPayloadResolved: () => {
					// If this was resolved from cache, we pass in to refresh
					// the cache.
					_resolveRoute(resolver, resolver.fromCache);
				},
			});

			// Now start the resolution.
			await resolver.resolvePayload();
		}
	}

	// Make sure this function isn't an async func. We want to make sure it can
	// do most of its work in the same tick so we can call it in the created()
	// hook after SSR returns data to client.
	function _resolveRoute(resolver: Resolver, fromCache?: boolean) {
		const { route, payload } = resolver;

		// We do a cache refresh if the cache was used for this route.
		if (fromCache === undefined) {
			fromCache = resolver.fromCache || false;
		}

		// If we are no longer resolving this resolver, let's early out.
		if (resolver.canceled) {
			return;
		}

		// We want to finalize the resolver before we do any of the early
		// returns below, or it may be stuck in the resolvers list forever.
		resolver.finalize();

		// Since this happens async, the component instance may be destroyed
		// already.
		if (isDestroyed.value) {
			return;
		}

		if (payload) {
			// If the payload errored out.
			if (payload instanceof PayloadError) {
				if (payload.type === PayloadErrorType.NewVersion) {
					// If it was a version change payload error, we want to
					// refresh the page so that it gets the new code.
					Navigate.reload();
				} else if (payload.type === PayloadErrorType.HttpError) {
					setError(payload.status || 500);
				}

				return;
			} else if (payload instanceof RouteLocationRedirect) {
				const redirectionPath = router.resolve(payload.location).href;

				// We want to clear out all current resolvers before doing the
				// redirect. They will re-resolve after the route changes.
				if (import.meta.env.SSR) {
					redirect(redirectionPath);
				} else {
					// We set the canonical link here so that crawlers that are
					// able to execute JS (Google) will hopefully see it before
					// we redirect and will know about the true page. Just in
					// case they don't follow the HIstory API as a redirect.
					Meta.seo.canonicalLink = redirectionPath;

					_clearActiveResolvers();
					router.replace(payload.location);
				}
				return;
			}

			if (resolverOptions.cache) {
				HistoryCache.store(route, payload, routeKey);
			}
		}

		onResolved?.({ payload, fromCache });
		isLoading.value = false;
		isBootstrapped.value = true;

		// Now that we've routed, make sure our title is up to date. We have to
		// do this outside the watcher that we set up in "created()" so that SSR
		// also gets updated.
		if (routeTitle.value) {
			setMetaTitle(routeTitle.value, disableTitleSuffix.value);
		}

		// We only want to emit the routeChangeAfter event once during a route
		// change. This ensures that we only do it during the leaf node resolve
		// and only if we aren't going to be refreshing cache after this. If we
		// need to refresh cache, it means we'll go through the resolve again
		// after fresh data, so we can just do the emit after that.
		if (isLeafRoute(routeKey) && !fromCache) {
			onRouteChangeAfter.next();
		}

		// If we used cache, then we want to refresh the route again async. This
		// allows cache to show really fast but still pull correct and new data
		// from the server.
		if (fromCache) {
			return _refreshCache(route);
		}
	}

	async function _refreshCache(route: RouteLocationNormalized) {
		const resolver = new Resolver(resolverOptions, route, {
			useCache: false,
			onPayloadResolved: () => {
				_resolveRoute(resolver, false);
			},
		});

		await resolver.resolvePayload();
	}

	return {
		isLoading,
		isBootstrapped,
		isDestroyed,
		reload,
	};
}

/**
 * If we aysynchronously load a route component into another component (through
 * a v-if), then it won't do the proper route resolving in SSR, since the
 * "created()" can't be async and the next() function will never find the
 * beforeRouteEnter hook since it's not in the route list to call. This allows
 * us to still resolve properly on SSR. Basically, we make an async component
 * out of the route, and assign the payload to it so that "created()" hook can
 * resolve it synchonously later.
 */
export async function asyncRouteLoader(router: Router, loader: Promise<any>) {
	if (!import.meta.env.SSR) {
		return loader;
	}

	const mod = await loader;
	const component = mod.default as ComponentOptions;

	// Basically copy the flow of the beforeRouteEnter for SSR.
	const resolver = new Resolver(component.appRouteOptions!, router.currentRoute.value, {
		useCache: false,
	});
	await resolver.resolvePayload();

	return mod;
}

class Resolver {
	constructor(
		public readonly resolverOptions: AppRouteOptionsInternal,
		public readonly route: RouteLocationNormalized,
		options: {
			useCache: boolean;
			onPayloadResolved?: () => void;
		}
	) {
		this.routeKey = resolverOptions.key;
		this.useCache = options.useCache;
		this.onPayloadResolved = options.onPayloadResolved;

		// If there's already a resolver resolving for this component, cancel it
		// first. Only one resolver at a time is valid.
		_activeRouteResolvers.get(this.routeKey)?.cancel();
		_activeRouteResolvers.set(this.routeKey, this);
	}

	readonly routeKey: symbol;
	readonly useCache: boolean;
	readonly onPayloadResolved?: () => void;

	isResolved = false;
	canceled = false;
	payload: any | PayloadError | RouteLocationRedirect;
	fromCache?: boolean;
	private _payloadPromise?: ReturnType<Resolver['_doResolvePayload']>;

	resolvePayload() {
		return (this._payloadPromise ??= this._doResolvePayload());
	}

	private async _doResolvePayload() {
		// Make a default resolver that returns void if there is none set.
		const resolverFunc = this.resolverOptions.resolver || (() => Promise.resolve());

		if (!import.meta.env.SSR && this.useCache) {
			if (HistoryCache.has(this.route, this.routeKey)) {
				this._resolveWith(HistoryCache.get(this.route, this.routeKey), true);
				return;
			}
		}

		try {
			// We try to load the config during route resolution to make sure we can
			// use the config within any views. It won't do anything if it has
			// already loaded.
			const [payload] = await Promise.all([
				resolverFunc({ route: this.route }),
				ensureConfig(),
			]);

			this._resolveWith(payload, false);
		} catch (e) {
			if (e instanceof PayloadError) {
				this._resolveWith(e, false);
				return;
			}
			throw e;
		}
	}

	private _resolveWith(payload: any, fromCache: boolean) {
		this.payload = payload;
		this.fromCache = fromCache;
		this.onPayloadResolved?.();
		this.isResolved = true;
	}

	finalize() {
		_activeRouteResolvers.delete(this.routeKey);
	}

	cancel() {
		this.canceled = true;
	}
}

/**
 * Stores a mapping of all resolvers that are currently resolving, mapped to the
 * route component's name that created it. We use this in order to resolve it
 * into the correct component instance.
 */
const _activeRouteResolvers = new Map<symbol, Resolver>();

function _clearActiveResolvers() {
	for (const [_, resolver] of _activeRouteResolvers) {
		resolver.cancel();
	}

	_activeRouteResolvers.clear();
}

/**
 * If all of the previous params are the same, then the already activated
 * components can stay the same. We only initialize routes that have probably
 * changed between updates.
 */
function _canSkipRouteUpdate(
	resolverOptions: AppRouteOptionsInternal,
	from: RouteLocationNormalized,
	to: RouteLocationNormalized
) {
	const reloadOn = _findReloadOnDependencies(resolverOptions, to);

	// If deps weren't defined then we need to refresh since the route _might_
	// depend on a changed param/query, or even the route itself (since the same
	// component may be used across different routes).
	if (reloadOn === 'always') {
		return false;
	}

	// If the route is set to never reload, then we can skip the route update.
	if (reloadOn === 'never') {
		return true;
	}

	const changedParams = _getChangedProperties(from.params, to.params);
	const changedQuery = _getChangedProperties(from.query, to.query);

	// Otherwise we should check the params and query against the deps to
	// see if we actually need to update.
	for (const param of changedParams) {
		if (reloadOn.params.indexOf(param) !== -1) {
			return false;
		}
	}

	for (const query of changedQuery) {
		if (reloadOn.query.indexOf(query) !== -1) {
			return false;
		}
	}

	return true;
}

function _findReloadOnDependencies(
	resolverOptions: AppRouteOptionsInternal,
	to: RouteLocationNormalized
): ReloadOnPreset | ReloadOnDeps {
	const collected = [];
	let found = false;

	for (const matched of to.matched) {
		const currentInstances = Object.values(matched.instances).map(i => i?.$options);
		collected.push(...currentInstances);

		if (
			currentInstances.findIndex(i => i?.appRouteOptions?.key === resolverOptions.key) !== -1
		) {
			found = true;
			break;
		}
	}

	// This shouldn't happen, but if it does, we want to mark this route
	// component as not being able to pull deps so that it reloads for any param
	// changes. It's the safest bet.
	if (!found) {
		return 'always';
	}

	const params: string[] = [];
	const query: string[] = [];
	for (const i of collected) {
		if (i?.appRouteOptions) {
			const options = i.appRouteOptions || {};

			// If there is a route resolve, but no deps were defined, it makes
			// the whole chain "dirty" and forces anything below it to resolve
			// always. It's because we don't know if the params can be ignored
			// or not.
			if (options.reloadOn === 'always') {
				return options.reloadOn;
			} else if (typeof options.reloadOn === 'object') {
				if (options.reloadOn.params) {
					params.push(...options.reloadOn.params);
				}

				if (options.reloadOn.query) {
					query.push(...options.reloadOn.query);
				}
			}
		}
	}

	return { params, query };
}

/**
 * Takes 2 objects as input, and returns any keys that are either new, deleted,
 * or updated.
 */
function _getChangedProperties(base: { [k: string]: any }, compare: { [k: string]: any }) {
	const changed = [];
	for (const k in base) {
		// New params.
		if (!(k in compare)) {
			changed.push(k);
		}
		// Updated params.
		else if (base[k] !== compare[k]) {
			changed.push(k);
		}
	}

	for (const k in compare) {
		// Deleted params.
		if (!(k in base)) {
			changed.push(k);
		}
	}

	return changed;
}

let _leafRoute: symbol | undefined;
function setLeafRoute(key?: symbol) {
	_leafRoute = key;
}

// The leaf route is the last in the hierarchy of routes. We only want to
// trigger the route change after this one has resolved, otherwise we end up
// triggering many routeChangeAfter events.
function isLeafRoute(key?: symbol) {
	return _leafRoute === key;
}
