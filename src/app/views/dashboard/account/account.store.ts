import { namespace } from 'vuex-class';
import {
	NamespaceVuexStore,
	VuexModule,
	VuexMutation,
	VuexStore,
} from '../../../../lib/gj-lib-client/utils/vuex';
import { store } from '../../../store';

type RouteActions = {};

type RouteMutations = {
	setHeading: string;
};

export const RouteStoreName = 'accountRoute';
export const RouteStoreModule = namespace(RouteStoreName);
export const routeStore = NamespaceVuexStore<RouteStore, RouteActions, RouteMutations>(
	store,
	RouteStoreName
);

@VuexModule()
export class RouteStore extends VuexStore<RouteStore, RouteActions, RouteMutations> {
	heading = '';

	@VuexMutation
	setHeading(heading: RouteMutations['setHeading']) {
		this.heading = heading;
	}
}
