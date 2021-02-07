import Vue from 'vue';
import Component from 'vue-class-component';
import { Inject } from 'vue-property-decorator';
import { number } from '../../../../../../../_common/filters/number';
import AppNavTabList from '../../../../../../../_common/nav/tab-list/tab-list.vue';
import { Screen } from '../../../../../../../_common/screen/screen-service';
import { AppNoAutoscroll } from '../../../../../../../_common/scroll/auto-scroll/no-autoscroll.directive';
import { AppCommunityPerms } from '../../../../../../components/community/perms/perms';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../../../view.store';
import AppCommunitiesViewPageContainer from '../../../_page-container/page-container.vue';

@Component({
	components: {
		AppCommunitiesViewPageContainer,
		AppCommunityPerms,
		AppNavTabList,
	},
	directives: {
		AppNoAutoscroll,
	},
})
export default class AppCommunitiesViewChannelHeaderCompetition extends Vue {
	@Inject(CommunityRouteStoreKey) routeStore!: CommunityRouteStore;

	readonly number = number;
	readonly Screen = Screen;

	get channel() {
		return this.routeStore.channel!;
	}

	get community() {
		return this.routeStore.community;
	}

	get competition() {
		return this.channel.competition!;
	}
}
