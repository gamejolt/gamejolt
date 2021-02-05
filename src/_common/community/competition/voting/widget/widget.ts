import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { Environment } from '../../../../environment/environment.service';
import { AppState, AppStore } from '../../../../store/app-store';
import { AppTimeAgo } from '../../../../time/ago/ago';
import { CommunityCompetition, CompetitionPeriodVoting } from '../../competition.model';
import { CommunityCompetitionEntry } from '../../entry/entry.model';
import { CommunityCompetitionVotingCategory } from '../../voting-category/voting-category.model';

/**
 * - voting disabled / community voting disabled / pre/running
 * - during voting:
 *  - not logged in
 *  - voting categories set, but none set up
 *	- own game (can't vote)
 *	- overall vote
 *	- category vote
 * - after voting:
 *	- no votes
 *	- overall vote results
 *	- category vote results
 */

@Component({
	components: {
		AppTimeAgo,
	},
})
export default class AppCommunityCompetitionVotingWidget extends Vue {
	@Prop(propRequired(CommunityCompetition)) competition!: CommunityCompetition;
	@Prop(propRequired(CommunityCompetitionEntry)) entry!: CommunityCompetitionEntry;
	@Prop(propRequired(CommunityCompetition))
	votingCategories!: CommunityCompetitionVotingCategory[];

	@AppState
	user!: AppStore['user'];

	get loginUrl() {
		// TODO: add hash to open this entry modal.
		return (
			Environment.authBaseUrl + '/login?redirect=' + encodeURIComponent(this.$route.fullPath)
		);
	}

	get shouldShow() {
		return (
			this.competition.is_voting_enabled &&
			this.competition.has_community_voting &&
			this.competition.periodNum >= CompetitionPeriodVoting
		);
	}

	get votingActive() {
		return this.competition.period === 'voting';
	}

	get votingCategoryError() {
		return this.competition.voting_type === 'categories' && this.votingCategories.length === 0;
	}

	get isOwner() {
		return false;
		return this.entry.author.id === this.user?.id;
	}
}
