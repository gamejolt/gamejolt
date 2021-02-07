<script lang="ts" src="./widget"></script>

<template>
	<div v-if="shouldShow">
		<template v-if="votingActive">
			<h3><translate>Cast Your Vote</translate></h3>
			<template v-if="!user">
				<div class="alert">
					<p>
						You must be
						<a v-app-auth-required :href="loginUrl">logged in</a>
						to Game Jolt to vote on a Jam entry.
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
						<translate>
							Nice try, my friend, but you can't vote on your own submission!
						</translate>
					</p>
				</div>
			</template>
			<template v-else>
				<div>
					<p
						v-if="competition.voting_type === 'categories'"
						key="voting-info"
						v-translate
					>
						Vote for this entry by rating it in each of the categories below. If a
						particular category doesn't apply for this entry, please choose
						<code>n/a</code>. For example, it would be appropriate to choose
						<code>n/a</code> for a "Graphics" category when rating a text-based game.
					</p>
					<p key="voting-period" class="help-block">
						<i>
							<span>
								<translate>The voting period will end in:</translate>
								<b>
									<app-time-ago
										is-future
										without-suffix
										:date="competition.voting_ends_on"
									/>
								</b>
							</span>
							<br />
							<span>
								<translate>
									Votes must be cast during the voting period. You can change your
									vote at any time before then, but after voting has ended, your
									decision will be finalized. You can vote for as many entries as
									you wish.
								</translate>
							</span>
						</i>
					</p>

					<form-community-competition-voting-cast
						:entry="entry"
						:competition="competition"
						:voting-categories="votingCategories"
						:initial-votes="userVotes"
					/>
				</div>
			</template>
		</template>

		<template v-else>
			<h3><translate>Voting Results</translate></h3>

			<template v-if="!competition.are_results_calculated">
				<p>
					<translate>
						We are currently working on processing the voting results. Check back later
						to see the final results!
					</translate>
				</p>
			</template>
			<template v-else-if="hasNoVotes">
				<p>
					<translate>
						Aw, shucks! This entry wasn't voted on during the voting period, which means
						it has no voting results. You can still check the game out, though!
					</translate>
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
						<a @click="onClickMoreInfo"><translate>more info</translate></a>
						]
					</small>
				</p>
				<template v-if="moreVoteResultInfoVisible">
					<h4><translate>How Are Voting Results Calculated?</translate></h4>
					<p>
						<translate>
							First, everyone rates entries from 1-5 in one or more categories. The
							ratings for each category are averaged to calculate a final score.
							Ratings of "n/a" are not included in the calculations.
						</translate>
					</p>
					<p>
						<translate>
							When the voting period ends, all scores given by all voters are
							tabulated to arrive at a weighted average for each entry. The weighted
							averages determine the entries' overall rankings.
						</translate>
					</p>
					<h4><translate>What's a Weighted Average?</translate></h4>
					<p>
						<translate>
							To arrive at a weighted average for a particular entry, its scores are
							compared to those of every other entry. Higher occurrences of the same
							score are given more value, or "weight".
						</translate>
					</p>
					<p>
						<translate>
							The goal is to come up with a projection, based on all available data,
							of the entry's "true average". The more votes an entry has, the more
							accurate this average will be.
						</translate>
					</p>
					<p>
						<translate>
							Using weighted averages prevents an entry with a single 5 rating from
							trumping entries with, for example, several 4 ratings. Similarly, if an
							entry gets only one low vote and several high ones, its overall score
							won't be crushed.
						</translate>
					</p>
				</template>
				<div>
					<table class="table">
						<thead>
							<tr>
								<th>
									<translate>Category</translate>
								</th>
								<th>
									<translate>Rank</translate>
								</th>
								<th>
									<translate>Score</translate>
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
									<app-jolticon
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
										number(voteResult.rating, {
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
@import '~styles/variables'
@import '~styles-lib/mixins'

.-rank-display
	font-size: $font-size-large
</style>
