import { Component, Inject } from 'vue-property-decorator';
import { router } from '../../..';
import { Api } from '../../../../../_common/api/api.service';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import {
	asyncRouteLoader,
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../_common/route/route-component';
import {
	CommunityRouteStore,
	CommunityRouteStoreKey,
	getChannelPathFromRoute,
} from '../view.store';

/**
 * Route dependencies for channel-type pages.
 */
export const CommunitiesViewChannelDeps = {
	params: ['path', 'channel'],
	query: ['sort', 'feed_last_id'],
};

@Component({
	name: 'RouteCommunitiesViewChannel',
	components: {
		RouteCommunitiesViewChannelFeed: () => asyncRouteLoader(import('./feed.vue'), router),
		RouteCommunitiesViewChannelJam: () => asyncRouteLoader(import('./jam.vue'), router),
	},
})
@RouteResolver({
	deps: { params: ['path', 'channel'] },
	resolver: ({ route }) => {
		const channel = getChannelPathFromRoute(route);
		return Api.sendRequest(`/web/communities/view-channel/${route.params.path}/${channel}`);
	},
})
export default class RouteCommunitiesViewChannel extends BaseRouteComponent {
	@Inject(CommunityRouteStoreKey) routeStore!: CommunityRouteStore;

	get community() {
		return this.routeStore.community;
	}

	get channel() {
		return this.routeStore.channel;
	}

	routeResolved($payload: any) {
		if ($payload.channel) {
			const channel = new CommunityChannel($payload.channel);
			if (this.channel) {
				this.channel.assign(channel);
			} else if (channel.is_archived) {
				this.routeStore.archivedChannels.push(channel);
			}
		}
	}
}
