import Component from 'vue-class-component';
import { Inject } from 'vue-property-decorator';
import { Api } from '../../../../../../_common/api/api.service';
import { BaseRouteComponent, RouteResolver } from '../../../../../../_common/route/route-component';
import { AppCommunityPerms } from '../../../../../components/community/perms/perms';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../../view.store';
import AppCommunitiesViewPageContainer from '../../_page-container/page-container.vue';

@Component({
	name: 'RouteCommunitiesViewEditCompetitions',
	components: {
		AppCommunitiesViewPageContainer,
		AppCommunityPerms,
	},
})
@RouteResolver({
	deps: { params: ['id'] },
	resolver: ({ route }) =>
		Api.sendRequest('/web/dash/communities/competitions/' + route.params.id),
})
export default class RouteCommunitiesViewEditCompetitions extends BaseRouteComponent {
	@Inject(CommunityRouteStoreKey) routeStore!: CommunityRouteStore;

	get community() {
		return this.routeStore.community;
	}
}
