import Vue from 'vue';
import Component from 'vue-class-component';
import { Inject } from 'vue-property-decorator';
import { number } from '../../../../../../../_common/filters/number';
import { Screen } from '../../../../../../../_common/screen/screen-service';
import AppCommunityCompetitionCountdown from '../../../../../../components/community/competition/countdown/countdown.vue';
import { AppCommunityPerms } from '../../../../../../components/community/perms/perms';
import AppPageHeaderControls from '../../../../../../components/page-header/controls/controls.vue';
import AppPageHeader from '../../../../../../components/page-header/page-header.vue';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../../../view.store';

@Component({
	components: {
		AppCommunityCompetitionCountdown,
		AppPageHeader,
		AppPageHeaderControls,
		AppCommunityPerms,
	},
	filters: {
		number,
	},
})
export default class AppCommunitiesViewChannelHeaderCompetition extends Vue {
	@Inject(CommunityRouteStoreKey) routeStore!: CommunityRouteStore;

	get channel() {
		return this.routeStore.channel!;
	}

	get community() {
		return this.routeStore.community;
	}

	get competition() {
		return this.channel.competition!;
	}

	get shouldShowDescription() {
		return Screen.isMobile || this.$route.name === 'communities.view.channel.description';
	}

	readonly Screen = Screen;
}
