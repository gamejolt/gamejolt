<script lang="ts" src="./modal"></script>

<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>
		<div class="modal-header">
			<h2 class="modal-title">
				<translate>{{ title }}</translate>
			</h2>
		</div>
		<div class="modal-body">
			<template v-if="!!m_entry">
				<div class="row">
					<div class="col-sm-8 -entry-info">
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
									<b>{{ m_entry.added_on | date('short') }}</b>
									<i class="text-muted">
										(<app-time-ago :date="m_entry.added_on" strict />)
									</i>
								</div>
							</div>
						</div>

						<div v-if="shouldShowAwards">
							<div
								v-for="entryAward of sortedAwards"
								:key="entryAward.id"
								class="-award"
							>
								<app-jolticon
									v-app-tooltip="$gettext(`Jam Award`)"
									class="-award-icon"
									icon="medal"
									big
									highlight
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

						<!-- Right column hidden on mobile, show inline -->
						<div v-if="Screen.isMobile" class="-section">
							<router-link :to="m_entry.resource.routeLocation">
								<app-game-thumbnail-img
									class="-game-thumb"
									:game="m_entry.resource"
								/>
							</router-link>

							<app-button
								block
								primary
								icon="chevron-right"
								:to="m_entry.resource.routeLocation"
							>
								<translate>View Game</translate>
							</app-button>
							<app-button block icon="link" @click="copyShareUrl">
								<translate>Copy Permalink</translate>
							</app-button>
						</div>

						<div class="-section">
							<span v-if="shouldShowVoteCount" class="-vote-count">
								<translate
									:translate-n="m_entry.vote_count"
									:translate-params="{ count: m_entry.vote_count }"
									translate-plural="This entry has %{ count } votes, currently. Check back after the voting period to see the final results."
								>
									This entry has %{ count } vote, currently. Check back after the
									voting period to see the final results.
								</translate>
							</span>

							<template v-if="competition">
								<app-community-competition-voting-widget
									:competition="competition"
									:entry="m_entry"
									:voting-categories="votingCategories"
									:user-votes="userVotes"
								/>
							</template>
							<app-loading v-else centered />
						</div>

						<div>
							<h3><translate>Activity</translate></h3>
							<template v-if="!user || user.id !== m_entry.user.id">
								<p>
									<translate>
										Here's a snippet of the activity for this jam entry. You can
										keep up with this game's development by following it.
									</translate>
								</p>
								<app-game-badge :game="m_entry.resource" />
							</template>
							<template v-else>
								<p>
									<translate>
										Here's a snippet of the activity for your jam entry.
									</translate>
								</p>
							</template>
							<app-activity-feed-placeholder v-if="!feed || !feed.isBootstrapped" />
							<template v-else>
								<div
									v-if="feed.hasItems"
									class="-feed"
									:class="{ '-feed-has-more': shouldShowFeedMore }"
								>
									<app-activity-feed class="-activity-feed" :feed="feed" />
									<div v-if="shouldShowFeedMore" class="-feed-more">
										<div class="-feed-more-item -feed-more-item-1" />
										<div class="-feed-more-item -feed-more-item-2" />
										<div class="-feed-more-item -feed-more-item-3" />
									</div>
								</div>
								<div v-else class="alert">
									<translate>
										Looks like the developer has not yet posted any updates.
									</translate>
								</div>
							</template>
						</div>
					</div>

					<!-- Show thumbnail on the right column on desktop -->
					<div v-if="Screen.isDesktop" class="col-sm-4">
						<router-link :to="m_entry.resource.routeLocation">
							<app-game-thumbnail-img class="-game-thumb" :game="m_entry.resource" />
						</router-link>

						<app-button
							block
							primary
							icon="chevron-right"
							:to="m_entry.resource.routeLocation"
						>
							<translate>View Game</translate>
						</app-button>
						<app-button block icon="link" @click="copyShareUrl">
							<translate>Copy Permalink</translate>
						</app-button>
					</div>
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

.-entry-info
	margin-bottom: 24px

.-author
	&-name
		font-size: $font-size-large

	&-avatar
		width: 46px

.-hover-card
	display: inline-block !important

.-vote-count
.-entered-date
	font-size: $font-size-small

.-game-thumb
	margin-bottom: 16px

.-award
	margin-top: 16px
	change-bg('backlight')
	color: var(--theme-highlight)
	padding: 16px
	rounded-corners-lg()

	&-icon
		float: left
		display: block

	&-details
		margin-left: 64px
		margin-top: 4px

.-activity-feed
	position: relative
	z-index: 2

.-feed
	position: relative

	&-has-more
		margin-bottom: 32px

	&-more
		z-index: 1
		position: absolute
		bottom: 0
		left: 0
		right: 0

		&-item
			position: absolute
			background-color: var(--theme-bg-backdrop)
			width: 100%
			rounded-corners-lg()
			height: 100px
			elevate-2()

			&-1
				bottom: -10px
				z-index: 3
				transform: scale(0.85)
				opacity: 0.85

			&-2
				bottom: -30px
				z-index: 2
				transform: scale(0.7)
				opacity: 0.7

			&-3
				bottom: -50px
				z-index: 1
				transform: scale(0.55)
				opacity: 0.55
</style>
