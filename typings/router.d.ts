import Vue from 'vue';
import {
	RouteResolverOptions,
	RouteStoreResolveCallback,
} from '../../components/route/route-component';
import { RouteStoreOptions } from '../../components/route/route-store';

declare module 'vue/types/options' {
	interface ComponentOptions<V extends Vue> {
		__RESOLVER__?: any;
		routeResolverOptions?: RouteResolverOptions & {
			hasResolver?: boolean;
			resolveStore?: RouteStoreResolveCallback;
		};
		routeStoreOptions?: RouteStoreOptions;
	}
}
