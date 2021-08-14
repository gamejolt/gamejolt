import {
	RouteResolverOptions,
	RouteStoreResolveCallback,
} from '../src/_common/route/route-component';
import { RouteStoreOptions } from '../src/_common/route/route-store';

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
