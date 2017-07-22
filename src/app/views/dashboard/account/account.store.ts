import { namespace, State, Action, Mutation } from 'vuex-class';
import { YoutubeChannel } from '../../../../lib/gj-lib-client/components/youtube/channel/channel-model';
import { VuexModule, VuexStore, VuexMutation } from '../../../../lib/gj-lib-client/utils/vuex';

export const RouteStoreName = 'accountRoute';
export const RouteState = namespace(RouteStoreName, State);
export const RouteAction = namespace(RouteStoreName, Action);
export const RouteMutation = namespace(RouteStoreName, Mutation);

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
