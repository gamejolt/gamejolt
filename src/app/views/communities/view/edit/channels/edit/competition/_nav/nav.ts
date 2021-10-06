import Vue from 'vue';
import Component from 'vue-class-component';
import { Inject } from 'vue-property-decorator';
import { CompetitionPeriodVoting } from '../../../../../../../../../_common/community/competition/competition.model';
import { number } from '../../../../../../../../../_common/filters/number';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../../../../../view.store';

@Component({})
export default class AppCommunitiesEditCompetitionNav extends Vue {
	@Inject(CommunityRouteStoreKey) routeStore!: CommunityRouteStore;

	readonly number = number;

	get competition() {
		return this.routeStore.competition!;
	}

	get canAssignAwards() {
		return (
			this.competition.is_voting_enabled &&
			this.competition.has_awards &&
			this.competition.periodNum >= CompetitionPeriodVoting
		);
	}
}
