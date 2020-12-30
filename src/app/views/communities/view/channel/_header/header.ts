import Vue from 'vue';
import Component from 'vue-class-component';
import { Inject } from 'vue-property-decorator';
import { Screen } from '../../../../../../_common/screen/screen-service';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../../view.store';
import AppCommunitiesViewPageContainer from '../../_page-container/page-container.vue';
import AppCommunitiesViewChannelHeaderCompetition from './competition/competition.vue';

@Component({
	components: {
		AppCommunitiesViewPageContainer,
		AppCommunitiesViewChannelHeaderCompetition,
	},
})
export default class AppCommunitiesViewChannelHeader extends Vue {
	@Inject(CommunityRouteStoreKey) routeStore!: CommunityRouteStore;

	get community() {
		return this.routeStore.community;
	}

	get channel() {
		return this.routeStore.channel!;
	}

	readonly Screen = Screen;
}
