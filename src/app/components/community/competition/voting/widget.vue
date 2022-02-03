<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { numberSort } from '../../../../../utils/array';
import { vAppAuthRequired } from '../../../../../_common/auth/auth-required-directive';
import {
	CommunityCompetition,
	CompetitionPeriodVoting,
} from '../../../../../_common/community/competition/competition.model';
import { CommunityCompetitionEntry } from '../../../../../_common/community/competition/entry/entry.model';
import { CommunityCompetitionEntryVote } from '../../../../../_common/community/competition/entry/vote/vote.model';
import { CommunityCompetitionVotingCategory } from '../../../../../_common/community/competition/voting-category/voting-category.model';
import { Environment } from '../../../../../_common/environment/environment.service';
import { formatNumber } from '../../../../../_common/filters/number';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { AppTimeAgo } from '../../../../../_common/time/ago/ago';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import FormCommunityCompetitionVotingCast from '../../../forms/community/competition/voting/cast/cast.vue';

@Options({
	components: {
		AppTimeAgo,
		FormCommunityCompetitionVotingCast,
	},
	directives: {
		AppTooltip: vAppTooltip,
		AppAuthRequired: vAppAuthRequired,
	},
})
export default class AppCommunityCompetitionVotingWidget extends Vue {
	@Prop({ type: Object, required: true }) competition!: CommunityCompetition;
	@Prop({ type: Object, required: true }) entry!: CommunityCompetitionEntry;
	@Prop({ type: Array, required: true }) votingCategories!: CommunityCompetitionVotingCategory[];
	@Prop({ type: Array, required: true }) userVotes!: CommunityCompetitionEntryVote[];
	@Prop({ type: Boolean, required: true }) isParticipant!: boolean;
	@Prop({ type: Boolean, required: true }) isArchived!: boolean;
	@Prop({ type: Boolean, required: true }) isBlocked!: boolean;

	commonStore = setup(() => useCommonStore());

	get user() {
		return this.commonStore.user;
	}

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
</script>

<template>
	<div v-if="shouldShow">
		<template v-if="votingActive">
			<h3><AppTranslate>Cast Your Vote</AppTranslate></h3>
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
					<p v-translate>
						<b>You have been blocked</b> from this community and cannot vote on jam
						entries.
					</p>
				</div>
			</template>
			<template v-else-if="isArchived">
				<div class="alert">
					<p v-translate>
						The channel for <b>this jam is archived</b> and voting is therefore
						disabled.
					</p>
				</div>
			</template>
			<template v-else-if="votingCategoryError">
				<div class="alert">
					<p v-translate>
						<b>Oops!</b> The Jam organizers wanted you to vote on multiple categories,
						but they did not add any categories to vote on.
					</p>
				</div>
			</template>
			<template v-else-if="isOwner">
				<div class="alert">
					<p>
						<AppTranslate>
							Nice try, my friend, but you can't vote on your own submission!
						</AppTranslate>
					</p>
				</div>
			</template>
			<template
				v-else-if="competition.voting_user_restriction === 'participants' && !isParticipant"
			>
				<div class="alert">
					<p>
						<AppTranslate>
							Only participants can vote on entries of this jam. To participate,
							submit an entry to this jam.
						</AppTranslate>
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
								<AppTranslate>The voting period will end in:</AppTranslate>
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
								<AppTranslate>
									Votes must be cast during the voting period. You can change your
									vote at any time before then, but after voting has ended, your
									decision will be finalized. You can vote for as many entries as
									you wish.
								</AppTranslate>
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
			<h3><AppTranslate>Voting Results</AppTranslate></h3>

			<template v-if="!competition.are_results_calculated">
				<p>
					<AppTranslate>
						We are currently working on processing the voting results. Check back later
						to see the final results!
					</AppTranslate>
				</p>
			</template>
			<template v-else-if="hasNoVotes">
				<p>
					<AppTranslate>
						Aw, shucks! This entry wasn't voted on during the voting period, which means
						it has no voting results. You can still check the game out, though!
					</AppTranslate>
				</p>
			</template>
			<template v-else>
				<p>
					<span
						v-translate="{
							voteCount: entry.vote_count,
							rank: overallRank,
							entryCount: competition.entry_count,
						}"
						:translate-n="entry.vote_count"
						translate-plural="This entry was voted on by <b>%{ voteCount }</b> people and its final ranking is <b>#%{ rank }</b> out of <b>%{ entryCount }</b> entries."
					>
						This entry was voted on by <b>%{ voteCount }</b> person and its final
						ranking is <b>#%{ rank }</b> out of <b>%{ entryCount }</b> entries.
					</span>
				</p>
				<p>
					<i v-translate>
						Overall rank is based on the weighted average, which takes into account all
						ratings for all entries.
					</i>
					<small v-if="!moreVoteResultInfoVisible">
						[
						<a @click="onClickMoreInfo"><AppTranslate>more info</AppTranslate></a>
						]
					</small>
				</p>
				<template v-if="moreVoteResultInfoVisible">
					<h4><AppTranslate>How Are Voting Results Calculated?</AppTranslate></h4>
					<p>
						<AppTranslate>
							First, everyone rates entries from 1-5 in one or more categories. The
							ratings for each category are averaged to calculate a final score.
							Ratings of "n/a" are not included in the calculations.
						</AppTranslate>
					</p>
					<p>
						<AppTranslate>
							When the voting period ends, all scores given by all voters are
							tabulated to arrive at a weighted average for each entry. The weighted
							averages determine the entries' overall rankings.
						</AppTranslate>
					</p>
					<h4><AppTranslate>What's a Weighted Average?</AppTranslate></h4>
					<p>
						<AppTranslate>
							To arrive at a weighted average for a particular entry, its scores are
							compared to those of every other entry. Higher occurrences of the same
							score are given more value, or "weight".
						</AppTranslate>
					</p>
					<p>
						<AppTranslate>
							The goal is to come up with a projection, based on all available data,
							of the entry's "true average". The more votes an entry has, the more
							accurate this average will be.
						</AppTranslate>
					</p>
					<p>
						<AppTranslate>
							Using weighted averages prevents an entry with a single 5 rating from
							trumping entries with, for example, several 4 ratings. Similarly, if an
							entry gets only one low vote and several high ones, its overall score
							won't be crushed.
						</AppTranslate>
					</p>
				</template>
				<div>
					<table class="table">
						<thead>
							<tr>
								<th>
									<AppTranslate>Category</AppTranslate>
								</th>
								<th>
									<AppTranslate>Rank</AppTranslate>
								</th>
								<th>
									<AppTranslate>Score</AppTranslate>
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
