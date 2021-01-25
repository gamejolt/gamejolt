import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../../../../utils/vue';
import { CommunityCompetition } from '../../../../../../../_common/community/competition/competition.model';
import { CommunityCompetitionEntry } from '../../../../../../../_common/community/competition/entry/entry.model';
import { CommunityCompetitionEntryVote } from '../../../../../../../_common/community/competition/entry/vote/vote.model';
import { CommunityCompetitionVotingCategory } from '../../../../../../../_common/community/competition/voting-category/voting-category.model';
import { number } from '../../../../../../../_common/filters/number';
import { AppTooltip } from '../../../../../../../_common/tooltip/tooltip-directive';

@Component({
	directives: {
		AppTooltip,
	},
	filters: {
		number,
	},
})
export default class FormCommunityCompetitionVotingCast extends Vue {
	@Prop(propRequired(CommunityCompetitionEntry)) entry!: CommunityCompetitionEntry;
	@Prop(propRequired(CommunityCompetition)) competition!: CommunityCompetition;
	@Prop(propOptional(Array, () => [])) votingCategories!: CommunityCompetitionVotingCategory[];
	@Prop(propOptional(Array, () => [])) initialVotes!: CommunityCompetitionEntryVote[];

	votes: CommunityCompetitionEntryVote[] = [];
	hoveredRatings: number[] = [];
	hasVoted = false;

	readonly number = number;

	get overallRating() {
		const validVoteCount = this.votes.filter(i => i.rating > 0).length;
		if (validVoteCount === 0) {
			return 0;
		}
		const sum = this.votes.reduce((a, b) => a + b.rating, 0);
		return sum / validVoteCount;
	}

	created() {
		this.hasVoted = this.initialVotes.length > 0;
		this.votes.push(...this.initialVotes);

		for (const votingCategory of this.votingCategories) {
			if (
				!this.votes.some(
					i => i.community_competition_voting_category_id === votingCategory.id
				)
			) {
				const vote = new CommunityCompetitionEntryVote({
					community_competition_voting_category_id: votingCategory.id,
					community_competition_entry_id: this.entry.id,
					rating: 0,
				});
				this.votes.push(vote);
			}

			this.hoveredRatings.push(0);
		}
	}

	isCategoryVote(votingCategory: CommunityCompetitionVotingCategory, i: number) {
		const vote = this.votes.find(
			i => i.community_competition_voting_category_id === votingCategory.id
		);
		if (!vote) {
			return false;
		}

		return vote.rating >= i;
	}

	isCategoryNA(votingCategory: CommunityCompetitionVotingCategory) {
		const vote = this.votes.find(
			i => i.community_competition_voting_category_id === votingCategory.id
		);
		return !vote || vote.rating === 0;
	}

	onRatingMouseEnter(votingCategory: CommunityCompetitionVotingCategory, i: number) {
		const index = this.votingCategories.indexOf(votingCategory);
		this.$set(this.hoveredRatings, index, i);
	}

	onRatingMouseLeave(votingCategory: CommunityCompetitionVotingCategory) {
		const index = this.votingCategories.indexOf(votingCategory);
		this.$set(this.hoveredRatings, index, 0);
	}

	isCategoryRatingHovered(votingCategory: CommunityCompetitionVotingCategory, i: number) {
		const index = this.votingCategories.indexOf(votingCategory);
		return this.hoveredRatings[index] >= i;
	}

	onClickRating(votingCategory: CommunityCompetitionVotingCategory, i: number) {
		const vote = this.votes.find(
			i => i.community_competition_voting_category_id === votingCategory.id
		);
		vote!.rating = i;
	}
}
