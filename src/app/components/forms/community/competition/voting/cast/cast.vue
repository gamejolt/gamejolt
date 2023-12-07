<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { Api } from '../../../../../../../_common/api/api.service';
import { CommunityCompetitionModel } from '../../../../../../../_common/community/competition/competition.model';
import { CommunityCompetitionEntryModel } from '../../../../../../../_common/community/competition/entry/entry.model';
import { CommunityCompetitionEntryVoteModel } from '../../../../../../../_common/community/competition/entry/vote/vote.model';
import { CommunityCompetitionVotingCategoryModel } from '../../../../../../../_common/community/competition/voting-category/voting-category.model';
import { formatNumber } from '../../../../../../../_common/filters/number';
import { showSuccessGrowl } from '../../../../../../../_common/growls/growls.service';
import AppLoadingFade from '../../../../../../../_common/loading/AppLoadingFade.vue';
import { vAppTooltip } from '../../../../../../../_common/tooltip/tooltip-directive';
import { numberSort } from '../../../../../../../utils/array';

@Options({
	components: {
		AppLoadingFade,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class FormCommunityCompetitionVotingCast extends Vue {
	@Prop({ type: Object, required: true }) entry!: CommunityCompetitionEntryModel;
	@Prop({ type: Object, required: true }) competition!: CommunityCompetitionModel;

	@Prop({ type: Array, default: () => [] })
	votingCategories!: CommunityCompetitionVotingCategoryModel[];

	@Prop({ type: Array, default: () => [] })
	initialVotes!: CommunityCompetitionEntryVoteModel[];

	votes: CommunityCompetitionEntryVoteModel[] = [];
	hoveredRatings: number[] = [];
	hasVoted = false;
	isSaving = false;

	readonly formatNumber = formatNumber;

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
					const vote = new CommunityCompetitionEntryVoteModel({
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
					new CommunityCompetitionEntryVoteModel({
						community_competition_voting_category_id: null,
						community_competition_entry_id: this.entry.id,
						rating: 0,
					})
				);
			}
			this.hoveredRatings.push(0);
		}
	}

	isCategoryVote(votingCategory: CommunityCompetitionVotingCategoryModel | null, i: number) {
		const votingCategoryId = votingCategory?.id || null;
		const vote = this.votes.find(
			i => i.community_competition_voting_category_id === votingCategoryId
		);
		if (!vote) {
			return false;
		}

		return vote.rating >= i;
	}

	isCategoryNA(votingCategory: CommunityCompetitionVotingCategoryModel) {
		const vote = this.votes.find(
			i => i.community_competition_voting_category_id === votingCategory.id
		);
		return !vote || vote.rating === 0;
	}

	onRatingMouseEnter(votingCategory: CommunityCompetitionVotingCategoryModel | null, i: number) {
		if (votingCategory === null) {
			this.hoveredRatings[0] = i;
		} else {
			const index = this.votingCategories.indexOf(votingCategory);
			this.hoveredRatings[index] = i;
		}
	}

	onRatingMouseLeave(votingCategory: CommunityCompetitionVotingCategoryModel | null) {
		if (votingCategory === null) {
			this.hoveredRatings[0] = 0;
		} else {
			const index = this.votingCategories.indexOf(votingCategory);
			this.hoveredRatings[index] = 0;
		}
	}

	isCategoryRatingHovered(
		votingCategory: CommunityCompetitionVotingCategoryModel | null,
		i: number
	) {
		const index = votingCategory === null ? 0 : this.votingCategories.indexOf(votingCategory);
		return this.hoveredRatings[index] >= i;
	}

	onClickRating(votingCategory: CommunityCompetitionVotingCategoryModel | null, i: number) {
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
		this.votes = CommunityCompetitionEntryVoteModel.populate(payload.votes);
		this.fillVotes();
		this.hasVoted = true;

		this.isSaving = false;

		showSuccessGrowl(this.$gettext(`Your vote for this entry was cast!`));
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
</script>

<template>
	<AppLoadingFade :is-loading="isSaving">
		<template v-if="competition.voting_type === 'categories'">
			<div
				v-for="votingCategory of sortedVotingCategories"
				:key="votingCategory.id"
				class="row"
			>
				<label class="col-sm-4 -category-label" control-label>
					{{ votingCategory.name }}
					<AppJolticon
						v-if="votingCategory.description"
						v-app-tooltip.touchable="votingCategory.description"
						class="text-muted"
						icon="help-circle"
					/>
				</label>
				<div class="col-sm-8 -ratings">
					<div
						class="-rating-bolts-container"
						:class="{ '-rating-bolts-container-active': isCategoryNA(votingCategory) }"
					>
						<div
							class="-rating -rating-na"
							:class="{ '-rating-na-active': isCategoryNA(votingCategory) }"
							@click="onClickRating(votingCategory, 0)"
						>
							<b><AppTranslate>n/a</AppTranslate></b>
						</div>
					</div>
					<div
						class="-rating-bolts-container"
						:class="{ '-rating-bolts-container-active': !isCategoryNA(votingCategory) }"
					>
						<div
							v-for="i of 5"
							:key="i"
							class="-rating -rating-bolt"
							:class="{ '-rating-bolt-active': isCategoryVote(votingCategory, i) }"
							@mouseenter="onRatingMouseEnter(votingCategory, i)"
							@mouseleave="onRatingMouseLeave(votingCategory)"
							@click="onClickRating(votingCategory, i)"
						>
							<AppJolticon
								:icon="
									isCategoryVote(votingCategory, i)
										? 'bolt-filled'
										: 'bolt-unfilled'
								"
								:class="{
									'-rating-bolt-hovered': isCategoryRatingHovered(
										votingCategory,
										i
									),
								}"
								big
							/>
						</div>
					</div>
				</div>
			</div>
			<div class="row">
				<label class="col-sm-4 -overall-label" control-label>
					<AppTranslate>Your Overall</AppTranslate>
					<div class="text-muted">
						<i><AppTranslate>(calculated)</AppTranslate></i>
					</div>
				</label>
				<div class="col-sm-8">
					<div class="-overall-rating">
						<b>
							<template v-if="overallRating === 0">
								<AppTranslate>n/a</AppTranslate>
							</template>
							<template v-else>
								{{ formatNumber(overallRating, { maximumFractionDigits: 2 }) }}
							</template>
						</b>
					</div>
					<div class="-controls">
						<AppButton
							icon="chevron-right"
							primary
							:disabled="!isSaveButtonEnabled"
							@click="onClickSave"
						>
							<AppTranslate>Save Vote</AppTranslate>
						</AppButton>
						<AppButton v-if="hasVoted" icon="remove" @click="onClickClear">
							<AppTranslate>Clear Vote</AppTranslate>
						</AppButton>
					</div>
				</div>
			</div>
		</template>
		<template v-else>
			<div>
				<div>
					<b><AppTranslate>Your Rating:</AppTranslate></b>
				</div>
			</div>
			<div class="-overall-rating-container">
				<div class="-rating-bolts-container -rating-bolts-container-active">
					<div
						v-for="i of 5"
						:key="i"
						class="-rating -rating-bolt"
						:class="{ '-rating-bolt-active': isCategoryVote(null, i) }"
						@mouseenter="onRatingMouseEnter(null, i)"
						@mouseleave="onRatingMouseLeave(null)"
						@click="onClickRating(null, i)"
					>
						<AppJolticon
							:icon="isCategoryVote(null, i) ? 'bolt-filled' : 'bolt-unfilled'"
							:class="{
								'-rating-bolt-hovered': isCategoryRatingHovered(null, i),
							}"
							big
						/>
					</div>
				</div>
				<span class="-overall-rating-text">
					<b>{{ overallRating }} / 5</b>
				</span>
			</div>
			<div class="-controls">
				<AppButton
					icon="chevron-right"
					primary
					:disabled="!isSaveButtonEnabled"
					@click="onClickSave"
				>
					<AppTranslate>Save Vote</AppTranslate>
				</AppButton>
				<AppButton v-if="hasVoted" icon="remove" @click="onClickClear">
					<AppTranslate>Clear Vote</AppTranslate>
				</AppButton>
			</div>
		</template>
	</AppLoadingFade>
</template>

<style lang="stylus" scoped>
.-category-label
	padding-top: 16px
	text-align: right

.-ratings
	display: flex

.-rating-bolts-container
	display: inline-flex
	rounded-corners()
	change-bg('bg')
	margin: 4px
	transition: background-color 0.5s ease
	border-width: 2px
	border-style: solid
	border-color: var(--theme-bg-offset)

	&-active
		change-bg('bg-offset')

.-rating
	display: flex
	justify-content: center
	align-items: center
	width: 48px
	height: 48px
	cursor: pointer

	&-na-active
		color: var(--theme-bi-bg)

	&-bolt
		opacity: 0.75

		::v-deep(.jolticon)
			transition: transform 0.1s ease
			transform: scale(0.8)
			font-size: 24px !important

		&-active
		&-hovered
			color: var(--theme-bi-bg)
			opacity: 1

			::v-deep(.jolticon)
				transform: none

.-overall-label
	text-align: right

.-overall-rating
	display: flex
	font-size: $font-size-large
	justify-content: center
	align-items: center
	width: 48px
	height: 48px

.-controls
	margin-top: 8px
	margin-left: 4px

.-overall-rating-container
	display: flex
	align-items: center

.-overall-rating-text
	display: inline-block
	margin-left: 16px
	font-size: $font-size-large
</style>
