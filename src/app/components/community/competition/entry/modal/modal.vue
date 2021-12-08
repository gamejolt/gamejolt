<script lang="ts" src="./modal"></script>

<template>
	<app-modal class="-entry-modal">
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>
		<div class="modal-body">
			<template v-if="!!m_entry">
				<app-game-badge full-bleed :game="m_entry.resource" />

				<div class="-section">
					<div class="pull-right">
						<app-user-card-hover :user="author">
							<app-user-avatar class="-author-avatar" :user="author" />
						</app-user-card-hover>
					</div>
					<div>
						<div class="-author-name">
							<translate>By</translate>
							<app-user-card-hover class="-hover-card" :user="author">
								<router-link
									:to="{
										name: 'profile.overview',
										params: { username: author.username },
									}"
								>
									{{ author.display_name }}
									<app-user-verified-tick :user="author" />
								</router-link>
							</app-user-card-hover>
						</div>
						<div class="-entered-date">
							<translate>Entered on</translate>
							<b>{{ formatDate(m_entry.added_on, 'short') }}</b>
							<i class="text-muted">
								(<app-time-ago :date="m_entry.added_on" strict />)
							</i>
						</div>
					</div>
				</div>

				<div class="row">
					<div class="col-sm-6 -entry-button">
						<app-button
							block
							primary
							icon="chevron-right"
							:to="m_entry.resource.routeLocation"
						>
							<translate>View Game</translate>
						</app-button>
					</div>
					<div class="col-sm-6 -entry-button">
						<app-button block icon="link" @click="copyShareUrl">
							<translate>Copy Voting Link</translate>
						</app-button>
					</div>
				</div>

				<div v-if="m_entry.is_removed" class="-section alert alert-notice">
					<p>
						<translate>
							This entry was removed from the jam and cannot be viewed anymore.
						</translate>
					</p>
				</div>

				<div v-if="shouldShowAwards">
					<div v-for="entryAward of sortedAwards" :key="entryAward.id" class="-award">
						<app-jolticon
							v-app-tooltip.touchable="$gettext(`Jam Award`)"
							class="-award-icon"
							icon="medal"
							big
						/>
						<div class="-award-details">
							<h4 class="sans-margin">
								{{ entryAward.community_competition_award.name }}
							</h4>
							<div v-if="entryAward.community_competition_award.description">
								<small>
									{{ entryAward.community_competition_award.description }}
								</small>
							</div>
						</div>
					</div>
				</div>

				<div class="-section">
					<span v-if="shouldShowVoteCount" class="-vote-count">
						<translate
							:translate-n="m_entry.vote_count"
							:translate-params="{ count: m_entry.vote_count }"
							translate-plural="This entry has %{ count } votes, currently. Check back after the voting period to see the final results."
						>
							This entry has %{ count } vote, currently. Check back after the voting
							period to see the final results.
						</translate>
					</span>

					<template v-if="competition">
						<app-community-competition-voting-widget
							:competition="competition"
							:entry="m_entry"
							:voting-categories="votingCategories"
							:user-votes="userVotes"
							:is-participant="isParticipant"
							:is-archived="isArchived"
							:is-blocked="isBlocked"
						/>
					</template>
					<app-loading v-else centered />
				</div>
			</template>

			<app-loading v-else centered />
		</div>
	</app-modal>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-section
	margin-bottom: 24px

.-author
	&-name
		font-size: $font-size-large

	&-avatar
		width: 46px

.-hover-card
	display: inline-block !important

.-entry-button
	margin-bottom: 4px

.-vote-count
.-entered-date
	font-size: $font-size-small

.-award
	margin-top: 16px
	change-bg('bi-bg')
	color: var(--theme-bi-fg)
	padding: 16px
	rounded-corners-lg()

	&-icon
		float: left
		display: block

	&-details
		margin-left: 64px
		margin-top: 4px
</style>
