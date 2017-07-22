import { namespace, State, Action, Mutation } from 'vuex-class';
import { YoutubeChannel } from '../../../../lib/gj-lib-client/components/youtube/channel/channel-model';
import { VuexModule, VuexStore, VuexMutation } from '../../../../lib/gj-lib-client/utils/vuex';

export const RouteStateName = 'accountRoute';
export const RouteState = namespace(RouteStateName, State);
export const RouteAction = namespace(RouteStateName, Action);
export const RouteMutation = namespace(RouteStateName, Mutation);

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
