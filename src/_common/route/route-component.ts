import Vue, { ComponentOptions } from 'vue';
import { createDecorator } from 'vue-class-component';
import { Component } from 'vue-property-decorator';
import VueRouter, { RawLocation, Route } from 'vue-router';
import { arrayRemove } from '../../utils/array';
import { LocationRedirect } from '../../utils/router';
import { asyncComponentLoader } from '../../utils/utils';
import { EventBus } from '../event-bus/event-bus.service';
import { HistoryCache } from '../history/cache/cache.service';
import { Meta } from '../meta/meta-service';
import { Navigate } from '../navigate/navigate.service';
import { PayloadError } from '../payload/payload-service';

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
	resolver?: (data: { route: Route }) => Promise<any>;
	resolveStore?: (data: { route: Route; payload: any; fromCache: boolean }) => void;
}

export type RouteStoreResolveCallback = (data: {
	route: Route;
	payload: any;
	fromCache: boolean;
}) => void;

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

	payload: any | PayloadError | LocationRedirect;

	constructor(public componentName: string, public route: Route) {}

	isValid(currentRoute: Route) {
		return Resolver.resolvers.indexOf(this) !== -1 && this.route === currentRoute;
	}

	static startResolve(componentOptions: ComponentOptions<Vue>, to: Route) {
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
export async function asyncRouteLoader(loader: Promise<any>, router: VueRouter) {
	const component = await asyncComponentLoader(loader);
	if (!GJ_IS_SSR) {
		return component;
	}

	// Basically copy the flow of the beforeRouteEnter for SSR.
	const options = component.options as ComponentOptions<Vue>;
	const to = router.currentRoute;
	const resolver = Resolver.startResolve(options, to);

	const { payload } = await getPayload(options, to, false);
	resolver.payload = payload;
	options.__RESOLVER__ = resolver;

	return component;
}

export function RouteResolver(options: RouteResolverOptions = {}) {
	return createDecorator(componentOptions => {
		// Store the options passed in.
		componentOptions.routeResolverOptions = {
			...componentOptions.routeResolverOptions,
			...options,
			hasResolver: true,
		};

		// Mixin a beforeRouteEnter method and funnel it off to our static
		// method. We need to do it this way since we need access to the
		// componentOptions.
		componentOptions.mixins = componentOptions.mixins || [];
		componentOptions.mixins.push({
			// This will get called by the browser and server. We call their
			// annotated function for fetching the data for the route.
			async beforeRouteEnter(
				to: Route,
				_from: Route,
				next: (to?: RawLocation | false | ((vm: Vue) => any) | void) => void
			) {
				const name = componentOptions.name!;
				const resolverOptions = componentOptions.routeResolverOptions || {};

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
				let hasCache = !!resolverOptions.cache ? HistoryCache.has(to, name) : false;
				const resolver = Resolver.startResolve(componentOptions, to);

				if (resolverOptions.lazy && !hasCache && !GJ_IS_SSR) {
					promise = getPayload(componentOptions, to, false);
				} else {
					const { payload } = await getPayload(
						componentOptions,
						to,
						!!resolverOptions.cache
					);
					resolver.payload = payload;

					// For server next() doesn't call, so we have to pull
					// this data within the created() hook. We also need
					// this data within the server.js file. We can pull from
					// all server locations from this options. Kind of
					// hacky, though.
					if (GJ_IS_SSR) {
						componentOptions.__RESOLVER__ = resolver;
					}
				}

				next(async (vm: BaseRouteComponent) => {
					// SSR still calls next() but won't re-render the route
					// component, so it's pointless to do things here.
					// Instead we do it in the component created() func.
					if (GJ_IS_SSR) {
						return;
					}

					if (promise) {
						vm.isRouteLoading = true;
						const { payload } = await promise;
						resolver.payload = payload;
					}

					await vm.resolveRoute(to, resolver);
				});
			},
		} as ComponentOptions<Vue>);
	});
}

@Component({})
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
			Meta.setTitle(this.routeTitle, this.disableRouteTitleSuffix);
		}

		this.$watch('routeTitle', (title: string | null) => {
			if (title) {
				Meta.setTitle(title, this.disableRouteTitleSuffix);
			}
		});

		if (GJ_IS_SSR) {
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

	destroyed() {
		this.isRouteDestroyed = true;
		this.routeDestroyed();
	}

	reloadRoute() {
		return this._reloadRoute(false);
	}

	private _findDeps(to: Route) {
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

	private async _onRouteChange(to: Route, from: Route) {
		const options = this.$options.routeResolverOptions || {};

		// Only do work if the route params/query has actually changed.
		if (this._canSkipRouteUpdate(from, to)) {
			return;
		}

		await this._reloadRoute(!!options.cache);
	}

	private async _reloadRoute(useCache = true) {
		const options = this.$options.routeResolverOptions || {};
		const to = this.$router.currentRoute;

		this.routeCreated();

		if (options.hasResolver) {
			const resolver = Resolver.startResolve(this.$options, to);
			this.isRouteLoading = true;
			this.disableRouteTitleSuffix = false;

			const { fromCache, payload } = await getPayload(this.$options, to, useCache);
			resolver.payload = payload;

			// If this was resolved from cache, we pass in to refresh the cache.
			await this.resolveRoute(to, resolver, fromCache);
		}
	}

	// Make sure this function isn't an async func. We want to make sure it can
	// do most of its work in the same tick so we can call it in the created()
	// hook after SSR returns data to client.
	resolveRoute(route: Route, resolver: Resolver, fromCache?: boolean) {
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
			} else if (payload instanceof LocationRedirect) {
				// We want to clear out all current resolvers before doing the
				// redirect. They will re-resolve after the route changes.
				if (GJ_IS_SSR) {
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
			Meta.setTitle(this.routeTitle, this.disableRouteTitleSuffix);
		}

		// We only want to emit the routeChangeAfter event once during a route
		// change. This ensures that we only do it during the leaf node resolve
		// and only if we aren't going to be refreshing cache after this. If we
		// need to refresh cache, it means we'll go through the resolve again
		// after fresh data, so we can just do the emit after that.
		if (isLeafRoute(this.$options.name) && !fromCache) {
			EventBus.emit('routeChangeAfter');
		}

		// If we used cache, then we want to refresh the route again async. This
		// allows cache to show really fast but still pull correct and new data
		// from the server.
		if (fromCache) {
			return this._refreshCache(route);
		}
	}

	private async _refreshCache(route: Route) {
		const resolver = Resolver.startResolve(this.$options, route);
		const { payload } = await getPayload(this.$options, route, false);
		resolver.payload = payload;
		await this.resolveRoute(route, resolver, false);
	}

	/**
	 * If all of the previous params are the same, then the already activated components can stay
	 * the same. We only initialize routes that have probably changed between updates.
	 */
	private _canSkipRouteUpdate(from: Route, to: Route) {
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
	componentOptions: ComponentOptions<Vue>,
	route: Route,
	useCache: boolean
) {
	const resolverOptions = componentOptions.routeResolverOptions || {};

	// Make a default resolver that returned void if there is none set.
	const resolverFunc = resolverOptions.resolver || (() => Promise.resolve());

	function resolveStore(route_: Route, payload: any, fromCache: boolean) {
		if (resolverOptions.resolveStore) {
			const ret = resolverOptions.resolveStore({ route: route_, payload, fromCache });
			if ((ret as any) instanceof Promise) {
				throw new Error(`resolveStore function can't be async.`);
			}
		}
	}

	if (!GJ_IS_SSR && useCache) {
		const cache = HistoryCache.get(route, componentOptions.name);
		if (cache) {
			resolveStore(route, cache.data, true);
			return { fromCache: true, payload: cache.data };
		}
	}

	try {
		const payload = await resolverFunc({ route });
		resolveStore(route, payload, false);
		return { fromCache: false, payload };
	} catch (e) {
		if (e instanceof PayloadError) {
			return { fromCache: false, payload: e };
		}
		throw e;
	}
}
