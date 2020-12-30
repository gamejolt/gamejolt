import Component from 'vue-class-component';
import { Inject } from 'vue-property-decorator';
import { Api } from '../../../../../../_common/api/api.service';
import { BaseRouteComponent, RouteResolver } from '../../../../../../_common/route/route-component';
import {
	CommunityRouteStore,
	CommunityRouteStoreKey,
	getChannelPathFromRoute,
} from '../../view.store';

@Component({
	name: 'RouteCommunitiesViewChannelGames',
	components: {},
})
@RouteResolver({
	deps: { params: ['path', 'channel'] },
	resolver: ({ route }) => {
		const channel = getChannelPathFromRoute(route);
		return Api.sendRequest(
			`/web/communities/competitions/games/${route.params.path}/${channel}`
		);
	},
})
export default class RouteCommunitiesViewChannelGames extends BaseRouteComponent {
	@Inject(CommunityRouteStoreKey) routeStore!: CommunityRouteStore;

	get channel() {
		return this.routeStore.channel!;
	}

	routeCreated() {
		if (this.channel.type !== 'competition') {
			this.$router.push({ name: 'communities.view.channel.feed' });
		}
	}
}
