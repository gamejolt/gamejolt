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
			<template v-else-if="competition.voting_type === 'categories'">
				<div>
					<p v-translate>
						Vote for this entry by rating it in each of the categories below. If a
						particular category doesn't apply for this entry, please choose
						<code>n/a</code>. For example, it would be appropriate to choose
						<code>n/a</code> for a "Graphics" category when rating a text-based game.
					</p>
					<p class="help-block">
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
						:initial-votes="[]"
					/>
				</div>
			</template>
		</template>
	</div>
</template>

<style lang="stylus" scoped></style>
