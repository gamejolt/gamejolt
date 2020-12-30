import Component from 'vue-class-component';
import { Inject } from 'vue-property-decorator';
import { BaseRouteComponent } from '../../../../../../../_common/route/route-component';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../../../view.store';

@Component({
	name: 'RouteCommunitiesViewEditCompetitionsDetails',
	components: {},
})
export default class RouteCommunitiesViewEditCompetitionDetails extends BaseRouteComponent {
	@Inject(CommunityRouteStoreKey) routeStore!: CommunityRouteStore;
}

// get competition() {
// 	return this.routeStore.competition;
// }

// routeResolved($payload: any) {
// 	// Assign currently edited competition.
// 	this.routeStore.competition = new CommunityCompetition($payload.competition);
// }
