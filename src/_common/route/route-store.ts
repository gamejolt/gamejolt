import { createDecorator } from 'vue-class-component';
import { Route } from 'vue-router';
import { VuexStore } from '../../utils/vuex';

export interface RouteStoreOptions {
	/** The global app store, needed so we can set the store module on it */
	store: VuexStore;
	routeStoreName: string;
	routeStoreClass: any;
	created?: (data: { route: Route }) => void;
	destroyed?: () => void;
}

export function WithRouteStore(options: RouteStoreOptions) {
	return createDecorator(componentOptions => {
		// Store the options passed in.
		componentOptions.routeStoreOptions = {
			...componentOptions.routeStoreOptions,
			...options,
		};

		// We unshift so that this always goes first before the RouteResolver
		// callback.
		componentOptions.mixins = componentOptions.mixins || [];
		componentOptions.mixins.unshift({
			beforeRouteEnter(route, _from, next) {
				const options = componentOptions.routeStoreOptions;
				if (options) {
					const { store, routeStoreClass, routeStoreName } = options;
					store.registerModule(routeStoreName, new routeStoreClass());

					if (options.created) {
						options.created({ route });
					}
				}

				next();
			},
			destroyed() {
				const options = componentOptions.routeStoreOptions;
				if (options) {
					const { store, routeStoreName } = options;
					if (options.destroyed) {
						options.destroyed();
					}

					store.unregisterModule(routeStoreName);
				}
			},
		});
	});
}
