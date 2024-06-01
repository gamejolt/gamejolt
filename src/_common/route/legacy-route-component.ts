import { computed, watch } from 'vue';
import { Options, Vue, createDecorator } from 'vue-class-component';
import {
	AppRoute,
	AppRouteOptions,
	createAppRoute,
	defineAppRouteOptions,
} from './route-component';

/**
 * Legacy decorator to specify this is a route component with options. Use the
 * composition API now instead.
 * @deprecated
 */
export function OptionsForLegacyRoute(options: AppRouteOptions) {
	return createDecorator(componentOptions => {
		Object.assign(componentOptions, defineAppRouteOptions(options));
	});
}

/**
 * Legacy base route component. Use the composition API now instead.
 * @deprecated
 */
@Options({})
export class LegacyRouteComponent extends Vue {
	isRouteDestroyed = false;
	isRouteLoading = false;
	isRouteBootstrapped = false;

	disableRouteTitleSuffix = false;

	/**
	 * This is the AppRoute that backs this component. Only reach into this
	 * direclty if absolutely required.
	 */
	protected appRoute_!: AppRoute;

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

	async created() {
		this.appRoute_ = createAppRoute({
			routeTitle: computed(() => this.routeTitle),
			disableTitleSuffix: computed(() => this.disableRouteTitleSuffix),
			onInit: this.routeCreated.bind(this),
			onDestroyed: this.routeDestroyed.bind(this),
			onResolved: ({ payload, fromCache }) => this.routeResolved(payload, fromCache),
		});

		watch(
			[this.appRoute_.isDestroyed, this.appRoute_.isLoading, this.appRoute_.isBootstrapped],
			([isDestroyed, isLoading, isBootstrapped]) => {
				this.isRouteDestroyed = isDestroyed;
				this.isRouteLoading = isLoading;
				this.isRouteBootstrapped = isBootstrapped;
			},
			{ immediate: true }
		);
	}

	reloadRoute() {
		return this.appRoute_.reload();
	}
}
