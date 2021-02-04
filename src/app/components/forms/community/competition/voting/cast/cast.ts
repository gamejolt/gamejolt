import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { numberSort } from '../../../../../../../utils/array';
import { propOptional, propRequired } from '../../../../../../../utils/vue';
import { Api } from '../../../../../../../_common/api/api.service';
import { CommunityCompetition } from '../../../../../../../_common/community/competition/competition.model';
import { CommunityCompetitionEntry } from '../../../../../../../_common/community/competition/entry/entry.model';
import { CommunityCompetitionEntryVote } from '../../../../../../../_common/community/competition/entry/vote/vote.model';
import { CommunityCompetitionVotingCategory } from '../../../../../../../_common/community/competition/voting-category/voting-category.model';
import { number } from '../../../../../../../_common/filters/number';
import { Growls } from '../../../../../../../_common/growls/growls.service';
import AppLoadingFade from '../../../../../../../_common/loading/fade/fade.vue';
import { AppTooltip } from '../../../../../../../_common/tooltip/tooltip-directive';

@Component({
	components: {
		AppLoadingFade,
	},
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
	isSaving = false;

	readonly number = number;

	get overallRating() {
		// With overall rating type, there is only 1 vote, which is also the overall.
		if (this.competition.voting_type === 'overall') {
			return this.votes[0].rating;
		}

		const validVoteCount = this.votes.filter(i => i.rating > 0).length;
		if (validVoteCount === 0) {
			return 0;
		}
		const sum = this.votes.reduce((a, b) => a + b.rating, 0);
		return sum / validVoteCount;
	}

	get isSaveButtonEnabled() {
		return this.overallRating > 0 && !this.isSaving;
	}

	get sortedVotingCategories() {
		return this.votingCategories.sort((a, b) => numberSort(a.sort, b.sort));
	}

	created() {
		this.hasVoted = this.initialVotes.length > 0;
		this.votes.push(...this.initialVotes);

		this.fillVotes();
	}

	fillVotes() {
		if (this.competition.voting_type === 'categories') {
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
		} else {
			if (this.votes.length === 0) {
				this.votes.push(
					new CommunityCompetitionEntryVote({
						community_competition_voting_category_id: null,
						community_competition_entry_id: this.entry.id,
						rating: 0,
					})
				);
			}
			this.hoveredRatings.push(0);
		}
	}

	isCategoryVote(votingCategory: CommunityCompetitionVotingCategory | null, i: number) {
		const votingCategoryId = votingCategory?.id || null;
		const vote = this.votes.find(
			i => i.community_competition_voting_category_id === votingCategoryId
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

	onRatingMouseEnter(votingCategory: CommunityCompetitionVotingCategory | null, i: number) {
		if (votingCategory === null) {
			this.$set(this.hoveredRatings, 0, i);
		} else {
			const index = this.votingCategories.indexOf(votingCategory);
			this.$set(this.hoveredRatings, index, i);
		}
	}

	onRatingMouseLeave(votingCategory: CommunityCompetitionVotingCategory | null) {
		if (votingCategory === null) {
			this.$set(this.hoveredRatings, 0, 0);
		} else {
			const index = this.votingCategories.indexOf(votingCategory);
			this.$set(this.hoveredRatings, index, 0);
		}
	}

	isCategoryRatingHovered(votingCategory: CommunityCompetitionVotingCategory | null, i: number) {
		const index = votingCategory === null ? 0 : this.votingCategories.indexOf(votingCategory);
		return this.hoveredRatings[index] >= i;
	}

	onClickRating(votingCategory: CommunityCompetitionVotingCategory | null, i: number) {
		const votingCategoryId = votingCategory?.id || null;
		const vote = this.votes.find(
			i => i.community_competition_voting_category_id === votingCategoryId
		);
		vote!.rating = i;
	}

	async onClickSave() {
		this.isSaving = true;

		const data = {} as any;
		if (this.competition.voting_type === 'categories') {
			for (const vote of this.votes) {
				data['vote_' + vote.community_competition_voting_category_id] = vote.rating;
			}
		} else {
			data['vote'] = this.votes[0].rating;
		}

		const payload = await Api.sendRequest(
			`/web/communities/competitions/voting/cast/${this.entry.id}`,
			data
		);
		this.votes = CommunityCompetitionEntryVote.populate(payload.votes);
		this.fillVotes();
		this.hasVoted = true;

		this.isSaving = false;

		Growls.success(this.$gettext(`Your vote for this entry was cast!`));
	}

	async onClickClear() {
		this.isSaving = true;

		await Api.sendRequest(`/web/communities/competitions/voting/clear/${this.entry.id}`, {});
		this.votes = [];
		this.fillVotes();
		this.hasVoted = false;

		this.isSaving = false;
	}
}
