import { namespace, State, Action, Mutation } from 'vuex-class';
import {
	VuexModule,
	VuexStore,
	VuexMutation,
} from '../../../../lib/gj-lib-client/utils/vuex';

export const RouteState = namespace('route', State);
export const RouteAction = namespace('route', Action);
export const RouteMutation = namespace('route', Mutation);

type Actions = {};

type Mutations = {
	setHeading: string;
};

@VuexModule()
export class RouteStore extends VuexStore<RouteStore, Actions, Mutations> {
	heading = '';

	@VuexMutation
	setHeading(heading: Mutations['setHeading']) {
		this.heading = heading;
	}
}
