import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../../../_common/api/api.service';
import { CommunityCompetitionAward } from '../../../../../../../../../_common/community/competition/award/award.model';
import AppLoading from '../../../../../../../../../_common/loading/loading.vue';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../../../_common/route/route-component';

type Payload = {
	awards: any[];
};

@Options({
	name: 'RouteCommunitiesViewEditChannelsCompetitionAssignAwards',
	components: {
		AppLoading,
	},
})
@RouteResolver({
	deps: { params: ['id', 'channel'] },
	resolver: ({ route }) =>
		Api.sendRequest(
			`/web/dash/communities/competitions/awards/${route.params.id}/${route.params.channel}`
		),
})
export default class RouteCommunitiesViewEditChannelsCompetitionAssignAwards extends BaseRouteComponent {
	awards: CommunityCompetitionAward[] = [];
	isLoading = true;

	get selectedAwardId() {
		const id = this.$route.params.awardId;
		if (typeof id === 'string') {
			return parseInt(id, 10);
		} else if (typeof id === 'number') {
			return id;
		}
	}

	get noAwardSelected() {
		return !this.selectedAwardId;
	}

	routeResolved($payload: Payload) {
		this.awards = CommunityCompetitionAward.populate($payload.awards);

		this.isLoading = false;
	}

	isAwardSelected(award: CommunityCompetitionAward) {
		return this.selectedAwardId === award.id;
	}

	onAssignAward(awardId: number) {
		const award = this.awards.find(i => i.id === awardId);
		if (award) {
			if (award.entry_count === null) {
				award.entry_count = 1;
			} else {
				award.entry_count++;
			}
		}
	}

	onUnassignAward(awardId: number) {
		const award = this.awards.find(i => i.id === awardId);
		if (award && award.entry_count !== null) {
			award.entry_count--;
		}
	}
}
