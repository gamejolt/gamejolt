import { Collaborator } from 'game-jolt-frontend-lib/components/collaborator/collaborator.model';
import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import {
	NamespaceVuexStore,
	VuexModule,
	VuexMutation,
	VuexStore,
} from 'game-jolt-frontend-lib/utils/vuex';
import { namespace } from 'vuex-class';
import { store } from '../../../../../store';

export const RouteStoreName = 'editRoute';
export const RouteStoreModule = namespace(RouteStoreName);
export const routeStore = NamespaceVuexStore<RouteStore, RouteActions, RouteMutations>(
	store,
	RouteStoreName
);

type RouteActions = {};
type RouteMutations = {
	populate: any;
};

@VuexModule()
export class RouteStore extends VuexStore<RouteStore, RouteActions, RouteMutations> {
	community: Community = null as any;
	collaboration: Collaborator | null = null;

	@VuexMutation
	populate(payload: RouteMutations['populate']) {
		this.community = new Community(payload.community);
		this.collaboration = payload.collaboration ? new Collaborator(payload.collaboration) : null;
	}
}
