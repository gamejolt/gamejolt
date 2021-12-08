import { Options, Prop, Vue } from 'vue-property-decorator';
import { numberSort } from '../../../../../utils/array';
import { propRequired } from '../../../../../utils/vue';
import {
	CommunityCompetition,
	CompetitionPeriodVoting,
} from '../../../../../_common/community/competition/competition.model';
import { CommunityCompetitionEntry } from '../../../../../_common/community/competition/entry/entry.model';
import { CommunityCompetitionEntryVote } from '../../../../../_common/community/competition/entry/vote/vote.model';
import { CommunityCompetitionVotingCategory } from '../../../../../_common/community/competition/voting-category/voting-category.model';
import { Environment } from '../../../../../_common/environment/environment.service';
import { formatNumber } from '../../../../../_common/filters/number';
import { AppState, AppStore } from '../../../../../_common/store/app-store';
import { AppTimeAgo } from '../../../../../_common/time/ago/ago';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import FormCommunityCompetitionVotingCast from '../../../forms/community/competition/voting/cast/cast.vue';

@Options({
	components: {
		AppTimeAgo,
		FormCommunityCompetitionVotingCast,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppCommunityCompetitionVotingWidget extends Vue {
	@Prop(propRequired(CommunityCompetition)) competition!: CommunityCompetition;
	@Prop(propRequired(CommunityCompetitionEntry)) entry!: CommunityCompetitionEntry;
	@Prop(propRequired(Array)) votingCategories!: CommunityCompetitionVotingCategory[];
	@Prop(propRequired(Array)) userVotes!: CommunityCompetitionEntryVote[];
	@Prop(propRequired(Boolean)) isParticipant!: boolean;
	@Prop(propRequired(Boolean)) isArchived!: boolean;
	@Prop(propRequired(Boolean)) isBlocked!: boolean;

	@AppState
	user!: AppStore['user'];

	moreVoteResultInfoVisible = false;

	readonly formatNumber = formatNumber;

	get loginUrl() {
		let url =
			Environment.authBaseUrl + '/login?redirect=' + encodeURIComponent(this.$route.fullPath);

		// Append the current entry modal hash to open it back up if there isn't one on the current url.
		if (!this.$route.hash) {
			const entryHash = '#entry-' + this.entry.id;
			url += encodeURIComponent(entryHash);
		}

		return url;
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
		return this.entry.author.id === this.user?.id;
	}

	get hasNoVotes() {
		return !this.entry.vote_results || this.entry.vote_results.length === 0;
	}

	get overallRank() {
		const overallResult = this.entry.vote_results.find(
			i => i.community_competition_voting_category_id === null
		);
		if (overallResult) {
			return overallResult.rank;
		}

		return 1;
	}

	get sortedVoteResults() {
		// Sort the vote results in the same manner as the categories are sorted.
		const categoryResults = this.entry.vote_results
			.filter(i => i.community_competition_voting_category_id !== null)
			.sort((a, b) =>
				numberSort(
					this.votingCategories.find(
						i => i.id === a.community_competition_voting_category_id
					)!.sort,
					this.votingCategories.find(
						i => i.id === b.community_competition_voting_category_id
					)!.sort
				)
			);

		// Put the "overall" result last.
		const overallResult = this.entry.vote_results.find(
			i => i.community_competition_voting_category_id === null
		)!;

		return [...categoryResults, overallResult];
	}

	onClickMoreInfo() {
		this.moreVoteResultInfoVisible = true;
	}

	getVotingCategoryDisplayName(votingCategoryId: number | null) {
		if (votingCategoryId === null) {
			return this.$gettext(`Overall`);
		}

		const category = this.votingCategories.find(i => i.id === votingCategoryId);
		if (category) {
			return category.name;
		}

		return this.$gettext(`Unknown`);
	}

	getVotingCategoryDescription(votingCategoryId: number | null) {
		const category = this.votingCategories.find(i => i.id === votingCategoryId);
		if (category) {
			return category.description;
		}
	}
}
