<script lang="ts" setup>
import { computed, ref } from 'vue';

import { Api } from '../../../../../../../_common/api/api.service';
import AppButton from '../../../../../../../_common/button/AppButton.vue';
import { CommunityCompetitionModel } from '../../../../../../../_common/community/competition/competition.model';
import { CommunityCompetitionEntryModel } from '../../../../../../../_common/community/competition/entry/entry.model';
import { CommunityCompetitionEntryVoteModel } from '../../../../../../../_common/community/competition/entry/vote/vote.model';
import { CommunityCompetitionVotingCategoryModel } from '../../../../../../../_common/community/competition/voting-category/voting-category.model';
import { formatNumber } from '../../../../../../../_common/filters/number';
import { showSuccessGrowl } from '../../../../../../../_common/growls/growls.service';
import AppJolticon from '../../../../../../../_common/jolticon/AppJolticon.vue';
import AppLoadingFade from '../../../../../../../_common/loading/AppLoadingFade.vue';
import { vAppTooltip } from '../../../../../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../../../../_common/translate/translate.service';
import { numberSort } from '../../../../../../../utils/array';

type Props = {
	entry: CommunityCompetitionEntryModel;
	competition: CommunityCompetitionModel;
	votingCategories?: CommunityCompetitionVotingCategoryModel[];
	initialVotes?: CommunityCompetitionEntryVoteModel[];
};

const { entry, competition, votingCategories = [], initialVotes = [] } = defineProps<Props>();

const votes = ref<CommunityCompetitionEntryVoteModel[]>([]);
const hoveredRatings = ref<number[]>([]);
const hasVoted = ref(false);
const isSaving = ref(false);

const overallRating = computed(() => {
	// With overall rating type, there is only 1 vote, which is also the overall.
	if (competition.voting_type === 'overall') {
		return votes.value[0].rating;
	}

	const validVoteCount = votes.value.filter(i => i.rating > 0).length;
	if (validVoteCount === 0) {
		return 0;
	}
	const sum = votes.value.reduce((a, b) => a + b.rating, 0);
	return sum / validVoteCount;
});

const isSaveButtonEnabled = computed(() => overallRating.value > 0 && !isSaving.value);

const sortedVotingCategories = computed(() =>
	[...votingCategories].sort((a, b) => numberSort(a.sort, b.sort))
);

// Initialize on created
hasVoted.value = initialVotes.length > 0;
votes.value.push(...initialVotes);
fillVotes();

function fillVotes() {
	if (competition.voting_type === 'categories') {
		for (const votingCategory of votingCategories) {
			if (
				!votes.value.some(
					i => i.community_competition_voting_category_id === votingCategory.id
				)
			) {
				const vote = new CommunityCompetitionEntryVoteModel({
					community_competition_voting_category_id: votingCategory.id,
					community_competition_entry_id: entry.id,
					rating: 0,
				});
				votes.value.push(vote);
			}

			hoveredRatings.value.push(0);
		}
	} else {
		if (votes.value.length === 0) {
			votes.value.push(
				new CommunityCompetitionEntryVoteModel({
					community_competition_voting_category_id: null,
					community_competition_entry_id: entry.id,
					rating: 0,
				})
			);
		}
		hoveredRatings.value.push(0);
	}
}

function isCategoryVote(votingCategory: CommunityCompetitionVotingCategoryModel | null, i: number) {
	const votingCategoryId = votingCategory?.id || null;
	const vote = votes.value.find(
		v => v.community_competition_voting_category_id === votingCategoryId
	);
	if (!vote) {
		return false;
	}

	return vote.rating >= i;
}

function isCategoryNA(votingCategory: CommunityCompetitionVotingCategoryModel) {
	const vote = votes.value.find(
		v => v.community_competition_voting_category_id === votingCategory.id
	);
	return !vote || vote.rating === 0;
}

function onRatingMouseEnter(
	votingCategory: CommunityCompetitionVotingCategoryModel | null,
	i: number
) {
	if (votingCategory === null) {
		hoveredRatings.value[0] = i;
	} else {
		const index = votingCategories.indexOf(votingCategory);
		hoveredRatings.value[index] = i;
	}
}

function onRatingMouseLeave(votingCategory: CommunityCompetitionVotingCategoryModel | null) {
	if (votingCategory === null) {
		hoveredRatings.value[0] = 0;
	} else {
		const index = votingCategories.indexOf(votingCategory);
		hoveredRatings.value[index] = 0;
	}
}

function isCategoryRatingHovered(
	votingCategory: CommunityCompetitionVotingCategoryModel | null,
	i: number
) {
	const index = votingCategory === null ? 0 : votingCategories.indexOf(votingCategory);
	return hoveredRatings.value[index] >= i;
}

function onClickRating(votingCategory: CommunityCompetitionVotingCategoryModel | null, i: number) {
	const votingCategoryId = votingCategory?.id || null;
	const vote = votes.value.find(
		v => v.community_competition_voting_category_id === votingCategoryId
	);
	vote!.rating = i;
}

async function onClickSave() {
	isSaving.value = true;

	const data = {} as any;
	if (competition.voting_type === 'categories') {
		for (const vote of votes.value) {
			data['vote_' + vote.community_competition_voting_category_id] = vote.rating;
		}
	} else {
		data['vote'] = votes.value[0].rating;
	}

	const payload = await Api.sendRequest(
		`/web/communities/competitions/voting/cast/${entry.id}`,
		data
	);
	votes.value = CommunityCompetitionEntryVoteModel.populate(payload.votes);
	fillVotes();
	hasVoted.value = true;

	isSaving.value = false;

	showSuccessGrowl($gettext(`Your vote for this entry was cast!`));
}

async function onClickClear() {
	isSaving.value = true;

	await Api.sendRequest(`/web/communities/competitions/voting/clear/${entry.id}`, {});
	votes.value = [];
	fillVotes();
	hasVoted.value = false;

	isSaving.value = false;
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
