import Component from 'vue-class-component';
import { Inject } from 'vue-property-decorator';
import { number } from '../../../../../../../../_common/filters/number';
import AppNavTabList from '../../../../../../../../_common/nav/tab-list/tab-list.vue';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../../_common/route/route-component';
import { Screen } from '../../../../../../../../_common/screen/screen-service';
import { Timezone } from '../../../../../../../../_common/timezone/timezone.service';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../../../../view.store';
import AppCommunitiesViewPageContainer from '../../../../_page-container/page-container.vue';
import AppCommunitiesEditCompetitionNav from './_nav/nav.vue';

@Component({
	name: 'RouteCommunitiesViewEditChannelsCompetition',
	components: {
		AppCommunitiesViewPageContainer,
		AppNavTabList,
		AppCommunitiesEditCompetitionNav,
	},
	filters: {
		number,
	},
})
@RouteResolver({
	// A lot of components and displays in the child routes need timezone info, so just fetch it here.
	resolver: () => Timezone.getTimezones(),
})
export default class RouteCommunitiesViewEditChannelsCompetition extends BaseRouteComponent {
	@Inject(CommunityRouteStoreKey) routeStore!: CommunityRouteStore;

	readonly Screen = Screen;

	get channel() {
		return this.routeStore.channel!;
	}

	get competition() {
		return this.routeStore.competition!;
	}
}
