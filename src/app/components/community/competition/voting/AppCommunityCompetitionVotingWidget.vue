<script lang="ts" setup>
import { computed, ref, toRef } from 'vue';
import { useRoute } from 'vue-router';

import FormCommunityCompetitionVotingCast from '~app/components/forms/community/competition/voting/cast/FormCommunityCompetitionVotingCast.vue';
import { vAppAuthRequired } from '~common/auth/auth-required-directive';
import {
	CommunityCompetitionModel,
	CompetitionPeriodVoting,
} from '~common/community/competition/competition.model';
import { CommunityCompetitionEntryModel } from '~common/community/competition/entry/entry.model';
import { CommunityCompetitionEntryVoteModel } from '~common/community/competition/entry/vote/vote.model';
import { CommunityCompetitionVotingCategoryModel } from '~common/community/competition/voting-category/voting-category.model';
import { Environment } from '~common/environment/environment.service';
import { formatNumber } from '~common/filters/number';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import { useCommonStore } from '~common/store/common-store';
import AppTimeAgo from '~common/time/AppTimeAgo.vue';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';
import { TranslateDirective as vTranslate } from '~common/translate/translate-directive';
import { numberSort } from '~utils/array';

type Props = {
	competition: CommunityCompetitionModel;
	entry: CommunityCompetitionEntryModel;
	votingCategories: CommunityCompetitionVotingCategoryModel[];
	userVotes: CommunityCompetitionEntryVoteModel[];
	isParticipant: boolean;
	isArchived: boolean;
	isBlocked: boolean;
};
const { competition, entry, votingCategories } = defineProps<Props>();

const { user } = useCommonStore();
const route = useRoute();

const moreVoteResultInfoVisible = ref(false);

const loginUrl = computed(() => {
	let url = Environment.authBaseUrl + '/login?redirect=' + encodeURIComponent(route.fullPath);

	// Append the current entry modal hash to open it back up if there isn't one on the current url.
	if (!route.hash) {
		const entryHash = '#entry-' + entry.id;
		url += encodeURIComponent(entryHash);
	}

	return url;
});

const shouldShow = computed(
	() =>
		competition.is_voting_enabled &&
		competition.has_community_voting &&
		competition.periodNum >= CompetitionPeriodVoting
);

const votingActive = toRef(() => competition.period === 'voting');

const votingCategoryError = toRef(
	() => competition.voting_type === 'categories' && votingCategories.length === 0
);

const isOwner = toRef(() => entry.author.id === user.value?.id);

const hasNoVotes = toRef(() => !entry.vote_results || entry.vote_results.length === 0);

const overallRank = computed(() => {
	const overallResult = entry.vote_results.find(
		i => i.community_competition_voting_category_id === null
	);
	if (overallResult) {
		return overallResult.rank;
	}

	return 1;
});

const sortedVoteResults = computed(() => {
	// Sort the vote results in the same manner as the categories are sorted.
	const categoryResults = entry.vote_results
		.filter(i => i.community_competition_voting_category_id !== null)
		.sort((a, b) =>
			numberSort(
				votingCategories.find(
					i => i.id === a.community_competition_voting_category_id
				)!.sort,
				votingCategories.find(
					i => i.id === b.community_competition_voting_category_id
				)!.sort
			)
		);

	// Put the "overall" result last.
	const overallResult = entry.vote_results.find(
		i => i.community_competition_voting_category_id === null
	)!;

	return [...categoryResults, overallResult];
});

function onClickMoreInfo() {
	moreVoteResultInfoVisible.value = true;
}

function getVotingCategoryDisplayName(votingCategoryId: number | null) {
	if (votingCategoryId === null) {
		return $gettext(`Overall`);
	}

	const category = votingCategories.find(i => i.id === votingCategoryId);
	if (category) {
		return category.name;
	}

	return $gettext(`Unknown`);
}

function getVotingCategoryDescription(votingCategoryId: number | null) {
	const category = votingCategories.find(i => i.id === votingCategoryId);
	if (category) {
		return category.description;
	}
}
</script>

<template>
	<div v-if="shouldShow">
		<template v-if="votingActive">
			<h3>{{ $gettext(`Cast Your Vote`) }}</h3>
			<template v-if="!user">
				<div class="alert">
					<p>
						You must be
						<a v-app-auth-required :href="loginUrl">logged in</a>
						to Game Jolt to vote on a Jam entry.
					</p>
				</div>
			</template>
			<template v-else-if="isBlocked">
				<div class="alert alert-notice">
					<AppTranslate tag="p">
						You have been blocked from this community and cannot vote on jam
						entries.
					</AppTranslate>
				</div>
			</template>
			<template v-else-if="isArchived">
				<div class="alert">
					<AppTranslate tag="p">
						The channel for this jam is archived and voting is therefore
						disabled.
					</AppTranslate>
				</div>
			</template>
			<template v-else-if="votingCategoryError">
				<div class="alert">
					<AppTranslate tag="p">
						Oops! The Jam organizers wanted you to vote on multiple categories,
						but they did not add any categories to vote on.
					</AppTranslate>
				</div>
			</template>
			<template v-else-if="isOwner">
				<div class="alert">
					<p>
						{{
							$gettext(
								`Nice try, my friend, but you can't vote on your own submission!`
							)
						}}
					</p>
				</div>
			</template>
			<template
				v-else-if="competition.voting_user_restriction === 'participants' && !isParticipant"
			>
				<div class="alert">
					<p>
						{{
							$gettext(
								`Only participants can vote on entries of this jam. To participate, submit an entry to this jam.`
							)
						}}
					</p>
				</div>
			</template>
			<template v-else>
				<div>
					<p v-if="competition.voting_type === 'categories'" v-translate>
						Vote for this entry by rating it in each of the categories below. If a
						particular category doesn't apply for this entry, please choose
						<code>n/a</code>. For example, it would be appropriate to choose
						<code>n/a</code> for a "Graphics" category when rating a text-based game.
					</p>
					<p class="help-block">
						<i>
							<span>
								{{ $gettext(`The voting period will end in:`) }}
								<b>
									<AppTimeAgo
										is-future
										without-suffix
										:date="competition.voting_ends_on"
									/>
								</b>
							</span>
							<br />
							<span>
								{{
									$gettext(
										`Votes must be cast during the voting period. You can change your vote at any time before then, but after voting has ended, your decision will be finalized. You can vote for as many entries as you wish.`
									)
								}}
							</span>
						</i>
					</p>

					<FormCommunityCompetitionVotingCast
						:entry="entry"
						:competition="competition"
						:voting-categories="votingCategories"
						:initial-votes="userVotes"
					/>
				</div>
			</template>
		</template>

		<template v-else>
			<h3>
				{{ $gettext(`Voting Results`) }}
			</h3>

			<template v-if="!competition.are_results_calculated">
				<p>
					{{
						$gettext(
							`We are currently working on processing the voting results. Check back later to see the final results!`
						)
					}}
				</p>
			</template>
			<template v-else-if="hasNoVotes">
				<p>
					{{
						$gettext(
							`Aw, shucks! This entry wasn't voted on during the voting period, which means it has no voting results. You can still check the game out, though!`
						)
					}}
				</p>
			</template>
			<template v-else>
				<p>
					<AppTranslate
						:translate-n="entry.vote_count"
						translate-plural="This entry was voted on by %{ voteCount } people and its final ranking is #%{ rank } out of %{ entryCount } entries."
						:translate-params="{
							voteCount: entry.vote_count,
							rank: overallRank,
							entryCount: competition.entry_count,
						}"
					>
						This entry was voted on by %{ voteCount } person and its final
						ranking is #%{ rank } out of %{ entryCount } entries.
					</AppTranslate>
				</p>
				<p>
					<AppTranslate>
						Overall rank is based on the weighted average, which takes into
						account all ratings for all entries.
					</AppTranslate>
					<small v-if="!moreVoteResultInfoVisible">
						[
						<a @click="onClickMoreInfo"> {{ $gettext(`more info`) }}</a>
						]
					</small>
				</p>
				<template v-if="moreVoteResultInfoVisible">
					<h4>{{ $gettext(`How Are Voting Results Calculated?`) }}</h4>
					<p>
						{{
							$gettext(
								`First, everyone rates entries from 1-5 in one or more categories. The ratings for each category are averaged to calculate a final score. Ratings of "n/a" are not included in the calculations.`
							)
						}}
					</p>
					<p>
						{{
							$gettext(
								`When the voting period ends, all scores given by all voters are tabulated to arrive at a weighted average for each entry. The weighted averages determine the entries' overall rankings.`
							)
						}}
					</p>
					<h4>
						{{ $gettext(`What's a Weighted Average?`) }}
					</h4>
					<p>
						{{
							$gettext(
								`To arrive at a weighted average for a particular entry, its scores are compared to those of every other entry. Higher occurrences of the same score are given more value, or "weight".`
							)
						}}
					</p>
					<p>
						{{
							$gettext(
								`The goal is to come up with a projection, based on all available data, of the entry's "true average". The more votes an entry has, the more accurate this average will be.`
							)
						}}
					</p>
					<p>
						{{
							$gettext(
								`Using weighted averages prevents an entry with a single 5 rating from trumping entries with, for example, several 4 ratings. Similarly, if an entry gets only one low vote and several high ones, its overall score won't be crushed.`
							)
						}}
					</p>
				</template>
				<div>
					<table class="table">
						<thead>
							<tr>
								<th>
									{{ $gettext(`Category`) }}
								</th>
								<th>
									{{ $gettext(`Rank`) }}
								</th>
								<th>
									{{ $gettext(`Score`) }}
								</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="voteResult of sortedVoteResults" :key="voteResult.id">
								<th>
									{{
										getVotingCategoryDisplayName(
											voteResult.community_competition_voting_category_id
										)
									}}
									<AppJolticon
										v-if="
											getVotingCategoryDescription(
												voteResult.community_competition_voting_category_id
											)
										"
										v-app-tooltip.touchable="
											getVotingCategoryDescription(
												voteResult.community_competition_voting_category_id
											)
										"
										class="text-muted"
										icon="help-circle"
									/>
								</th>
								<td>
									<b class="-rank-display">#{{ voteResult.rank }}</b>
								</td>
								<td>
									{{
										formatNumber(voteResult.rating, {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
										})
									}}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</template>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.-rank-display
	font-size: $font-size-large
</style>
