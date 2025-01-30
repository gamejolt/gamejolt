import { AppRouteOptionsInternal } from '../src/_common/route/route-component';

declare module 'vue' {
	interface ComponentCustomOptions {
		appRouteOptions?: AppRouteOptionsInternal;
	}
}
