import { ComponentOptions, getCurrentInstance, onUnmounted, ref, watch, watchEffect } from 'vue';
import { RouteLocationNormalized, Router, useRouter } from 'vue-router';
import { RouteLocationRedirect } from '../../utils/router';
import { MaybeRef } from '../../utils/vue';
import { ensureConfig } from '../config/config.service';
import { HistoryCache } from '../history/cache/cache.service';
import { setMetaTitle } from '../meta/meta-service';
import { Navigate } from '../navigate/navigate.service';
import { PayloadError } from '../payload/payload-service';
import { useCommonStore } from '../store/common-store';
import { onRouteChangeAfter, RouteResolverOptions } from './route-component';

export function defineRouteComponent(
	resolverOptions: { name: string } & RouteResolverOptions
): ComponentOptions {
	const name = resolverOptions.name;

	return {
		name,
		routeResolverOptions: resolverOptions,
		async beforeRouteEnter(to, _from) {
			// The router crawls through each matched route and calls
			// beforeRouteEnter on them one by one. Since we continue to
			// set the leaf route the last one is the only one that will
			// be saved as the leaf.
			setLeafRoute(name);

			const hasCache = resolverOptions.cache ? HistoryCache.has(to, name) : false;

			if (resolverOptions.lazy && !hasCache && !import.meta.env.SSR) {
				const resolver = new Resolver(resolverOptions, to, {
					useCache: false,
				});

				// In this case we want to resolve lazily. The created() hook of the
				// component will pick up the Resolver and finish out resolving it.
				resolver.resolvePayload();
			} else {
				const resolver = new Resolver(resolverOptions, to, {
					useCache: !!resolverOptions.cache,
				});

				// In this case we want to make sure we resolve the payload before
				// resolving the route so that the data is set immediately. The
				// created() hook of the component will see that this Resolver is
				// already resolved and immediately resolve the route with this
				// data.
				await resolver.resolvePayload();
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
	routeTitle: MaybeRef<string | null>;
	disableTitleSuffix?: MaybeRef<boolean>;

	/**
	 * Called to initialize the route either at the first route to this
	 * component or after the $route object changes with params.
	 */
	onInit?: () => void;

	/**
	 * Called after the resolver resolves with data.
	 */
	onResolved?: (options: { payload: any; fromCache: boolean }) => void;

	/**
	 * Called when the route component is completely destroyed.
	 */
	onDestroyed?: () => void;
}) {
	const { setError, redirect } = useCommonStore();
	const router = useRouter();
	const instance = getCurrentInstance()!;
	const resolverOptions = (instance.type as ComponentOptions).routeResolverOptions!;

	if (!resolverOptions) {
		throw new Error(`Route component must be wrapped in defineRouteComponent().`);
	}

	const isDestroyed = ref(false);
	const isLoading = ref(false);
	const isBootstrapped = ref(false);
	const disableTitleSuffix = ref(options.disableTitleSuffix ?? false);
	const routeTitle = ref(options.routeTitle);

	onInit?.();

	watch(router.currentRoute, (to, from) => _onRouteChange(to, from), { flush: 'post' });

	watchEffect(() => {
		setMetaTitle(routeTitle.value, disableTitleSuffix.value);
	});

	const activeResolver = _activeRouteResolvers.get(resolverOptions.name);
	if (activeResolver) {
		// If we were resolving lazily, let's finalize it.
		if (!activeResolver.isResolved) {
			isLoading.value = true;
			activeResolver.resolvePayload().then(() => _resolveRoute(activeResolver));
		} else {
			_resolveRoute(activeResolver);
		}
	}
	// There should always be a route resolver for normal route components when
	// the created() hook gets called. If there isn't, then this was probably
	// v-ifed out of the tree and then put in dynamically. We have to manually
	// trigger the resolve from the beginning in this case.
	else {
		if (resolverOptions.hasResolver) {
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

		if (resolverOptions.hasResolver) {
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
		const name = resolverOptions.name;
		const { route, payload } = resolver;

		// We do a cache refresh if the cache was used for this route.
		if (fromCache === undefined) {
			fromCache = HistoryCache.has(route, name);
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
				if (payload.type === PayloadError.ERROR_NEW_VERSION) {
					// If it was a version change payload error, we want to
					// refresh the page so that it gets the new code.
					Navigate.reload();
				} else if (payload.type === PayloadError.ERROR_HTTP_ERROR) {
					setError(payload.status || 500);
				}

				return;
			} else if (payload instanceof RouteLocationRedirect) {
				// We want to clear out all current resolvers before doing the
				// redirect. They will re-resolve after the route changes.
				// TODO(vue3-ssr): Why do we do things differently here for SSR?
				if (import.meta.env.SSR) {
					redirect(router.resolve(payload.location).href);
				} else {
					_clearActiveResolvers();
					router.replace(payload.location);
				}
				return;
			}

			if (resolverOptions.cache) {
				HistoryCache.store(route, payload, name);
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
		if (isLeafRoute(resolverOptions.name) && !fromCache) {
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

	const component = (await loader).default;

	// Basically copy the flow of the beforeRouteEnter for SSR.
	const resolver = new Resolver(component, router.currentRoute.value, {
		useCache: false,
	});
	await resolver.resolvePayload();

	return loader;
}

class Resolver {
	constructor(
		public resolverOptions: RouteResolverOptions,
		public route: RouteLocationNormalized,
		options: {
			useCache: boolean;
			onPayloadResolved?: () => void;
		}
	) {
		this.routeKey = resolverOptions.name;
		this.useCache = options.useCache;
		this.onPayloadResolved = options.onPayloadResolved;

		// If there's already a resolver resolving for this component, cancel it
		// first. Only one resolver at a time is valid.
		_activeRouteResolvers.get(this.routeKey)?.cancel();
		_activeRouteResolvers.set(this.routeKey, this);
	}

	routeKey: string;
	useCache: boolean;
	onPayloadResolved?: () => void;

	isResolved = false;
	payload: any | PayloadError | RouteLocationRedirect;
	fromCache?: boolean;
	private _payloadPromise?: ReturnType<Resolver['_doResolvePayload']>;

	canceled = false;

	resolvePayload() {
		return (this._payloadPromise ??= this._doResolvePayload());
	}

	private async _doResolvePayload() {
		// Make a default resolver that returns void if there is none set.
		const resolverFunc = this.resolverOptions.resolver || (() => Promise.resolve());

		if (!import.meta.env.SSR && this.useCache) {
			const cache = HistoryCache.get(this.route, this.routeKey);
			if (cache) {
				this._resolveWith(cache.data, true);
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
const _activeRouteResolvers = new Map<string, Resolver>();

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
	resolverOptions: RouteResolverOptions,
	from: RouteLocationNormalized,
	to: RouteLocationNormalized
) {
	const deps = _findDeps(resolverOptions, to);
	const changedParams = _getChangedProperties(from.params, to.params);
	const changedQuery = _getChangedProperties(from.query, to.query);

	if (deps === null) {
		// If deps weren't defined, and either params or query has changed,
		// then we need to refresh since the route _might_ depend on a
		// changed param/query.
		if (changedParams.length > 0 || changedQuery.length > 0) {
			return false;
		}
	} else {
		// Otherwise we should check the params and query against the deps to
		// see if we actually need to update.

		for (const param of changedParams) {
			if (deps.params.indexOf(param) !== -1) {
				return false;
			}
		}

		for (const query of changedQuery) {
			if (deps.query.indexOf(query) !== -1) {
				return false;
			}
		}
	}

	return true;
}

function _findDeps(resolverOptions: RouteResolverOptions, to: RouteLocationNormalized) {
	const collected = [];
	let found = false;

	for (const matched of to.matched) {
		const currentInstances = Object.values(matched.instances).map(i => i?.$options);
		collected.push(...currentInstances);

		if (currentInstances.findIndex(i => i?.name === resolverOptions.name) !== -1) {
			found = true;
			break;
		}
	}

	// This shouldn't happen, but if it does, we want to mark this route
	// component as not being able to pull deps so that it reloads for any param
	// changes. It's the safest bet.
	if (!found) {
		return null;
	}

	const params: string[] = [];
	const query: string[] = [];
	for (const i of collected) {
		if (i?.routeResolverOptions) {
			const options = i.routeResolverOptions || {};

			// If there is a route resolve, but no deps were defined, it makes
			// the whole chain "dirty" and forces anything below it to resolve
			// always. It's because we don't know if the params can be ignored
			// or not.
			if (!options.deps) {
				return null;
			} else {
				if (options.deps.params) {
					params.push(...options.deps.params);
				}

				if (options.deps.query) {
					query.push(...options.deps.query);
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

let leafRoute: string | undefined;
function setLeafRoute(name?: string) {
	leafRoute = name;
}

// The leaf route is the last in the hierarchy of routes. We only want to
// trigger the route change after this one has resolved, otherwise we end up
// triggering many routeChangeAfter events.
function isLeafRoute(name?: string) {
	return leafRoute === name;
}
