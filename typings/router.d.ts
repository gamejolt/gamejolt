import {
	RouteResolverOptions,
	RouteStoreOptions,
	RouteStoreResolveCallback,
} from '../src/_common/route/route-component';

declare module '@vue/runtime-core' {
	interface ComponentCustomOptions {
		__RESOLVER__?: any;
		routeResolverOptions?: RouteResolverOptions & {
			hasResolver?: boolean;
			resolveStore?: RouteStoreResolveCallback;
		};
		routeStoreOptions?: RouteStoreOptions;
	}
}
