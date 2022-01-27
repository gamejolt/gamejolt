import { AppRouteOptionsInternal } from '../src/_common/route/route-component';

declare module '@vue/runtime-core' {
	interface ComponentCustomOptions {
		appRouteOptions?: AppRouteOptionsInternal;
	}
}
