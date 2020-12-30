import Component from 'vue-class-component';
import { Inject } from 'vue-property-decorator';
import { Api } from '../../../../../../_common/api/api.service';
import { CommunityCompetition } from '../../../../../../_common/community/competition/competition.model';
import AppLoading from '../../../../../../_common/loading/loading.vue';
import { BaseRouteComponent, RouteResolver } from '../../../../../../_common/route/route-component';
import { AppCommunityPerms } from '../../../../../components/community/perms/perms';
import AppPageHeader from '../../../../../components/page-header/page-header.vue';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../../view.store';
import AppCommunitiesViewPageContainer from '../../_page-container/page-container.vue';

@Component({
	name: 'RouteCommunitiesViewEditCompetitions',
	components: {
		AppCommunitiesViewPageContainer,
		AppCommunityPerms,
		AppPageHeader,
		AppLoading,
	},
})
@RouteResolver({
	deps: { params: ['id', 'compId'] },
	resolver: ({ route }) =>
		Api.sendRequest(
			'/web/dash/communities/competitions/edit/' + route.params.id + '/' + route.params.compId
		),
})
export default class RouteCommunitiesViewEditCompetition extends BaseRouteComponent {
	@Inject(CommunityRouteStoreKey) routeStore!: CommunityRouteStore;

	get community() {
		return this.routeStore.community;
	}

	get channel() {
		return this.routeStore.channel!;
	}

	get competition() {
		return this.routeStore.competition!;
	}

	get isLoading() {
		return !this.routeStore.channelPath;
	}

	routeResolved($payload: any) {
		this.routeStore.channelPath = $payload.channel.title;

		// Assign the new data to the existing comp.
		const competition = new CommunityCompetition($payload.competition);
		if (this.channel.competition) {
			this.channel.competition.assign(competition);
		} else {
			this.channel.competition = competition;
		}
	}
}
