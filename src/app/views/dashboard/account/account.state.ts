import { namespace, State, Action, Mutation } from 'vuex-class';
import { YoutubeChannel } from '../../../../lib/gj-lib-client/components/youtube/channel/channel-model';
import { VuexAction } from '../../../../lib/gj-lib-client/utils/vuex';
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
	channels: YoutubeChannel[] = [];

	@VuexMutation
	setHeading(heading: Mutations['setHeading']) {
		this.heading = heading;
	}
}
