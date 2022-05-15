import '@vue/runtime-core';

declare module '@vue/runtime-core' {
	// TODO(vite-no-devserver) should this be in sync with whatever is in
	// environment.d.ts? what is this for? typing in templates?
	interface ComponentCustomProperties {
		GJ_SECTION: typeof GJ_SECTION;
		GJ_ENVIRONMENT: typeof GJ_ENVIRONMENT;
		GJ_IS_STAGING: typeof GJ_IS_STAGING;
		GJ_BUILD_TYPE: typeof GJ_BUILD_TYPE;
		GJ_IS_DESKTOP_APP: typeof GJ_IS_DESKTOP_APP;
		GJ_IS_SSR: boolean;
		GJ_VERSION: typeof GJ_VERSION;
		GJ_WITH_UPDATER: typeof GJ_WITH_UPDATER;
	}
}
