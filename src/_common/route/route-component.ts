import { ComponentOptions, defineAsyncComponent } from 'vue';
import { createDecorator } from 'vue-class-component';
import { Options, Vue } from 'vue-property-decorator';
import { RouteLocationNormalized, Router } from 'vue-router';
import { arrayRemove } from '../../utils/array';
import { RouteLocationRedirect } from '../../utils/router';
import { VuexStore } from '../../utils/vuex';
import { ensureConfig } from '../config/config.service';
import { HistoryCache } from '../history/cache/cache.service';
import { setMetaTitle } from '../meta/meta-service';
import { Navigate } from '../navigate/navigate.service';
import { PayloadError } from '../payload/payload-service';
import { EventTopic } from '../system/event/event-topic';

// This is component state that the server may have returned to the browser. It
// can be used to bootstrap components with initial data.
const serverComponentState =
	typeof window !== 'undefined' &&
	window.__INITIAL_STATE__ &&
	window.__INITIAL_STATE__.components;

export interface RouteResolverOptions {
	lazy?: boolean;
	cache?: boolean;
	reloadOnHashChange?: boolean;
	deps?: { params?: string[]; query?: string[] };
	resolver?: (data: { route: RouteLocationNormalized }) => Promise<any>;
	resolveStore?: (data: {
		route: RouteLocationNormalized;
		payload: any;
		fromCache: boolean;
	}) => void;
}

export type RouteStoreResolveCallback = (data: {
	route: RouteLocationNormalized;
	payload: any;
	fromCache: boolean;
}) => void;

/**
 * Subscribe to know when the route has finished changing.
 */
export const onRouteChangeAfter = new EventTopic<void>();

/**
 * Takes 2 objects as input, and returns any keys that are either new, deleted,
 * or updated.
 */
function getChangedProperties(base: { [k: string]: any }, compare: { [k: string]: any }) {
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

class Resolver {
	private static resolvers: Resolver[] = [];

	payload: any | PayloadError | RouteLocationRedirect;

	constructor(public componentName: string, public route: RouteLocationNormalized) {}

	isValid(currentRoute: RouteLocationNormalized) {
		return Resolver.resolvers.indexOf(this) !== -1 && this.route === currentRoute;
	}

	static startResolve(componentOptions: ComponentOptions, to: RouteLocationNormalized) {
		const resolver = new Resolver(componentOptions.name!, to);
		Resolver.resolvers.push(resolver);
		return resolver;
	}

	static removeResolver(resolver: Resolver) {
		arrayRemove(Resolver.resolvers, i => i === resolver);
	}

	static isComponentResolving(name: string) {
		return Resolver.resolvers.findIndex(i => i.componentName === name) !== -1;
	}

	static clearResolvers() {
		this.resolvers = [];
	}
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
export async function asyncRouteLoader(loader: Promise<any>, router: Router) {
	// TODO(vue3): who knows what I'm supposed to do here...
	const component = defineAsyncComponent(() => loader);
	if (!import.meta.env.SSR) {
		return component;
	}

	// Basically copy the flow of the beforeRouteEnter for SSR.
	const options = component.options as ComponentOptions;
	const to = router.currentRoute.value;
	const resolver = Resolver.startResolve(options, to);

	const { payload } = await getPayload(options, to, false);
	resolver.payload = payload;
	options.__RESOLVER__ = resolver;

	return component;
}

export interface RouteStoreOptions {
	/** The global app store, needed so we can set the store module on it */
	store: VuexStore;
	routeStoreName: string;
	routeStoreClass: any;
	created?: (data: { route: RouteLocationNormalized }) => void;
	destroyed?: () => void;
}

export function RouteResolver(options: RouteResolverOptions = {}) {
	return createDecorator(componentOptions => {
		// Store the options passed in.
		componentOptions.routeResolverOptions = {
			...componentOptions.routeResolverOptions,
			...options,
			hasResolver: true,
		};

		_setupBeforeRouteEnter(componentOptions);
	});
}

export function WithRouteStore(options: RouteStoreOptions) {
	return createDecorator(componentOptions => {
		// Store the options passed in.
		componentOptions.routeStoreOptions = {
			...componentOptions.routeStoreOptions,
			...options,
		};

		_setupBeforeRouteEnter(componentOptions);
	});
}

/**
 * Initializes the route enter for the component to call any hooks that are
 * needed for our routing (such as resolvers and stores).
 *
 * We need to make sure we call this in any of our decorators that need to hook
 * in to the before route enter phase of our route component.
 */
function _setupBeforeRouteEnter(options: ComponentOptions) {
	if (options.beforeRouteEnter) {
		// Already set, we should be good.
		return;
	}

	options.beforeRouteEnter = async (to, _from, next) => {
		// We handle stores first, and then the resolver.
		if (options.routeStoreOptions) {
			// Set up the store they configured for this route.
			const { store, routeStoreClass, routeStoreName, created } = options.routeStoreOptions;
			store.registerModule(routeStoreName, new routeStoreClass());

			created?.({ route: to });

			// NOTE: We do the cleanup in the [BaseRouteComponent.unmounted].
		}

		if (options.routeResolverOptions) {
			const name = options.name!;
			const resolverOptions = options.routeResolverOptions || {};

			// The router crawls through each matched route and calls
			// beforeRouteEnter on them one by one. Since we continue to
			// set the leaf route the last one is the only one that will
			// be saved as the leaf.
			setLeafRoute(name);

			// If we have component state from the server for any route
			// components, then we want to instead bootstrap the
			// components from that data. Early out of this function.
			// We'll bootstrap the data through the created() method
			// instead. It will fail the hydration unless we set the
			// data during the created() method.
			if (serverComponentState && serverComponentState[name]) {
				return next();
			}

			let promise: Promise<{ fromCache: boolean; payload: any }> | undefined;
			const hasCache = resolverOptions.cache ? HistoryCache.has(to, name) : false;
			const resolver = Resolver.startResolve(options, to);

			if (resolverOptions.lazy && !hasCache && !import.meta.env.SSR) {
				promise = getPayload(options, to, false);
			} else {
				const { payload } = await getPayload(options, to, !!resolverOptions.cache);
				resolver.payload = payload;

				// For server next() doesn't call, so we have to pull
				// this data within the created() hook. We also need
				// this data within the server.js file. We can pull from
				// all server locations from this options. Kind of
				// hacky, though.
				if (import.meta.env.SSR) {
					options.__RESOLVER__ = resolver;
				}
			}

			next(async (vm: BaseRouteComponent) => {
				// SSR still calls next() but won't re-render the route
				// component, so it's pointless to do things here.
				// Instead we do it in the component created() func.
				if (import.meta.env.SSR) {
					return;
				}

				if (promise) {
					vm.isRouteLoading = true;
					const { payload } = await promise;
					resolver.payload = payload;
				}

				await vm.resolveRoute(to, resolver);
			});
		} else {
			next();
		}
	};
}

@Options({})
export class BaseRouteComponent extends Vue {
	isRouteDestroyed = false;
	isRouteLoading = false;
	isRouteBootstrapped = false;

	disableRouteTitleSuffix = false;

	get routeTitle(): null | string {
		return null;
	}

	/**
	 * Called to initialize the route either at the first route to this
	 * component or after the $route object changes.
	 */
	routeCreated(): void {}

	/**
	 * Called after the resolver resolves with data.
	 */
	routeResolved(_payload: any, _fromCache: boolean) {}

	/**
	 * Called when the route component is completely destroyed.
	 */
	routeDestroyed() {}

	// Don't allow this to be async. We want it to execute right away so that
	// SSR doesn't break.
	created() {
		const name = this.$options.name!;

		this.routeCreated();

		// For some reason the @Watch decorator was attaching multiple times in
		// very random scenarios.
		this.$watch('$route', (to: any, from: any) => this._onRouteChange(to, from));

		// Set up to watch the route title change.
		if (this.routeTitle) {
			setMetaTitle(this.routeTitle, this.disableRouteTitleSuffix);
		}

		this.$watch('routeTitle', (title: string | null) => {
			if (title) {
				setMetaTitle(title, this.disableRouteTitleSuffix);
			}
		});

		if (import.meta.env.SSR) {
			// In SSR we have to store the resolver for each route component
			// somewhere. Since we don't have an instance we instead put it into
			// the component's static options. Yay for hacks! Let's use it and
			// resolve it here.
			if (this.$options.__RESOLVER__) {
				this.resolveRoute(this.$route, this.$options.__RESOLVER__);
			}
		} else if (serverComponentState && serverComponentState[name]) {
			// If we are in a browser context, the server may have set initial
			// state for the routed components. If this is the case we want to
			// pull it into the component options so it can bootstrap fast.
			const resolver = Resolver.startResolve(this.$options, this.$route);
			resolver.payload = serverComponentState[name];
			serverComponentState[name] = undefined;

			// Make sure we don't refresh cache.
			this.resolveRoute(this.$route, resolver, false);
		} else {
			// If this route component wasn't in the DOM (v-if maybe?) when the
			// route changed, then it won't trigger the resolve flow. We have to
			// manually trigger the resolve in this case.
			const options = this.$options.routeResolverOptions || {};
			if (options.hasResolver && !Resolver.isComponentResolving(name)) {
				this._reloadRoute(!!options.cache);
			}
		}
	}

	unmounted() {
		// If they had some up a route store using [WithRouteStore], we need to
		// destroy it.
		const options = this.$options.routeStoreOptions;
		if (options) {
			const { store, routeStoreName, destroyed } = options;

			destroyed?.();
			store.unregisterModule(routeStoreName);
		}

		this.isRouteDestroyed = true;
		this.routeDestroyed();
	}

	reloadRoute() {
		return this._reloadRoute(false);
	}

	private _findDeps(to: RouteLocationNormalized) {
		const collected: BaseRouteComponent[] = [];
		let found = false;

		for (const matched of to.matched) {
			const currentInstances = Object.values(matched.instances) as BaseRouteComponent[];
			collected.push(...currentInstances);

			if (currentInstances.indexOf(this) !== -1) {
				found = true;
				break;
			}
		}

		// This shouldn't happen, but if it doesn't, we want to mark this route
		// component as not being able to pull deps so that it reloads for any
		// param changes. It's the safest bet.
		if (!found) {
			return null;
		}

		const params: string[] = [];
		const query: string[] = [];
		for (const i of collected) {
			if (i.$options.routeResolverOptions) {
				const options = i.$options.routeResolverOptions || {};

				// If there is a route resolve, but no deps were defined, it
				// makes the whole chain "dirty" and forces anything below it to
				// resolve always. It's because we don't know if the params can
				// be ignored or not.
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

	private async _onRouteChange(to: RouteLocationNormalized, from: RouteLocationNormalized) {
		const options = this.$options.routeResolverOptions || {};

		// Only do work if the route params/query has actually changed.
		if (this._canSkipRouteUpdate(from, to)) {
			return;
		}

		await this._reloadRoute(!!options.cache);
	}

	private async _reloadRoute(useCache = true) {
		const options = this.$options.routeResolverOptions || {};
		const to = this.$router.currentRoute.value;

		this.routeCreated();

		if (options.hasResolver) {
			const resolver = Resolver.startResolve(this.$options, to);
			this.isRouteLoading = true;

			const { fromCache, payload } = await getPayload(this.$options, to, useCache);
			resolver.payload = payload;

			// If this was resolved from cache, we pass in to refresh the cache.
			await this.resolveRoute(to, resolver, fromCache);
		}
	}

	// Make sure this function isn't an async func. We want to make sure it can
	// do most of its work in the same tick so we can call it in the created()
	// hook after SSR returns data to client.
	resolveRoute(route: RouteLocationNormalized, resolver: Resolver, fromCache?: boolean) {
		const resolverOptions = this.$options.routeResolverOptions || {};
		const name = this.$options.name!;

		// We do a cache refresh if the cache was used for this route.
		if (fromCache === undefined) {
			fromCache = HistoryCache.has(route, name);
		}

		// If we are no longer resolving this resolver, let's early out.
		if (!resolver.isValid(this.$route)) {
			return;
		}

		// We want to remove the resolver before we do any of the early returns
		// below, or it may be stuck in the resolvers list forever.
		Resolver.removeResolver(resolver);

		// Since this happens async, the component instance may be destroyed
		// already.
		if (this.isRouteDestroyed) {
			return;
		}

		const payload = resolver.payload;
		if (payload) {
			// If the payload errored out.
			if (payload instanceof PayloadError) {
				if (payload.type === PayloadError.ERROR_NEW_VERSION) {
					// If it was a version change payload error, we want to
					// refresh the page so that it gets the new code.
					Navigate.reload();
				} else if (payload.type === PayloadError.ERROR_HTTP_ERROR) {
					this.$store.commit('app/setError', payload.status || 500);
				}
				return;
			} else if (payload instanceof RouteLocationRedirect) {
				// We want to clear out all current resolvers before doing the
				// redirect. They will re-resolve after the route changes.
				if (import.meta.env.SSR) {
					this.$store.commit('app/redirect', this.$router.resolve(payload.location).href);
				} else {
					Resolver.clearResolvers();
					this.$router.replace(payload.location);
				}
				return;
			}

			if (resolverOptions.cache) {
				HistoryCache.store(route, payload, name);
			}
		}

		this.routeResolved(payload, fromCache);
		this.isRouteLoading = false;
		this.isRouteBootstrapped = true;

		// Now that we've routed, make sure our title is up to date. We have to
		// do this outside the watcher that we set up in "created()" so that SSR
		// also gets updated.
		if (this.routeTitle) {
			setMetaTitle(this.routeTitle, this.disableRouteTitleSuffix);
		}

		// We only want to emit the routeChangeAfter event once during a route
		// change. This ensures that we only do it during the leaf node resolve
		// and only if we aren't going to be refreshing cache after this. If we
		// need to refresh cache, it means we'll go through the resolve again
		// after fresh data, so we can just do the emit after that.
		if (isLeafRoute(this.$options.name) && !fromCache) {
			onRouteChangeAfter.next();
		}

		// If we used cache, then we want to refresh the route again async. This
		// allows cache to show really fast but still pull correct and new data
		// from the server.
		if (fromCache) {
			return this._refreshCache(route);
		}
	}

	private async _refreshCache(route: RouteLocationNormalized) {
		const resolver = Resolver.startResolve(this.$options, route);
		const { payload } = await getPayload(this.$options, route, false);
		resolver.payload = payload;
		await this.resolveRoute(route, resolver, false);
	}

	/**
	 * If all of the previous params are the same, then the already activated components can stay
	 * the same. We only initialize routes that have probably changed between updates.
	 */
	private _canSkipRouteUpdate(from: RouteLocationNormalized, to: RouteLocationNormalized) {
		const deps = this._findDeps(to);
		const changedParams = getChangedProperties(from.params, to.params);
		const changedQuery = getChangedProperties(from.query, to.query);

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

/**
 * This will call the function to get the payload. It will return a promise that
 * will resolve with the data. If we are caching, then we will try to return the
 * cache data.
 */
async function getPayload(
	componentOptions: ComponentOptions,
	route: RouteLocationNormalized,
	useCache: boolean
) {
	const resolverOptions = componentOptions.routeResolverOptions || {};

	// Make a default resolver that returned void if there is none set.
	const resolverFunc = resolverOptions.resolver || (() => Promise.resolve());

	function resolveStore(route_: RouteLocationNormalized, payload: any, fromCache: boolean) {
		// We never resolve the store if the payload was a redirect. It'll
		// eventually get handled in the `resolveRoute` function.
		if (!resolverOptions.resolveStore || payload instanceof RouteLocationRedirect) {
			return;
		}

		const ret = resolverOptions.resolveStore({ route: route_, payload, fromCache });
		if ((ret as any) instanceof Promise) {
			throw new Error(`resolveStore function can't be async.`);
		}
	}

	if (!import.meta.env.SSR && useCache) {
		const cache = HistoryCache.get(route, componentOptions.name);
		if (cache) {
			resolveStore(route, cache.data, true);
			return { fromCache: true, payload: cache.data };
		}
	}

	try {
		// We try to load the config during route resolution to make sure we can
		// use the config within any views. It won't do anything if it has
		// already loaded.
		const [payload] = await Promise.all([resolverFunc({ route }), ensureConfig()]);

		resolveStore(route, payload, false);
		return { fromCache: false, payload };
	} catch (e) {
		if (e instanceof PayloadError) {
			return { fromCache: false, payload: e };
		}
		throw e;
	}
}
