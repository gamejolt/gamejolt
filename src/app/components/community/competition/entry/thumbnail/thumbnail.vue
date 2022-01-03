<script lang="ts" src="./thumbnail"></script>

<template>
	<div class="-container">
		<router-link :to="game.routeLocation">
			<div @click.prevent="onClickThumbnail">
				<div class="-thumb">
					<app-game-thumbnail-img :game="game" class="-game-img" />

					<div v-if="shouldShowAwards" class="-game-img-award-border" />

					<div class="-inner">
						<div v-if="shouldShowRank" class="-rank">
							{{ displayCategoryName }}
							<translate>Rank</translate>
							<b>#{{ displayRank }}</b>
						</div>
						<div v-else-if="shouldShowNoVotes" class="-rank">
							<translate>No Votes</translate>
						</div>
						<div v-if="shouldShowRemove" class="-remove">
							<app-button
								v-app-tooltip="$gettext(`Remove Entry`)"
								icon="remove"
								sparse
								circle
								overlay
								@click.stop.prevent="onClickRemove"
							/>
						</div>
					</div>
				</div>
				<div class="-meta">
					<div class="-title-data">
						<span class="-title" :title="game.title">
							<b>{{ game.title }}</b>
						</span>
					</div>
					<div class="-author-data">
						<span
							v-translate="{ name: entry.user.display_name }"
							class="text-muted -author"
						>
							by %{ name }
						</span>
					</div>

					<div v-if="shouldShowAwards" class="-award-data">
						<span
							v-for="entryAward of entry.awards"
							:key="entryAward.id"
							v-app-tooltip="entryAward.community_competition_award.description"
							class="-award"
						>
							<app-jolticon class="-award-icon" icon="medal" />
							<small>
								<b>{{ entryAward.community_competition_award.name }}</b>
							</small>
						</span>
					</div>
				</div>
			</div>
		</router-link>
	</div>
</template>

<style lang="stylus" scoped>
.-container
	margin-bottom: 24px

.-thumb
	position: relative
	rounded-corners-lg()

	&:hover
		.-rank
			opacity: 0.25

		.-game-img
			elevate-2()

.-game-img
	elevate-0()
	z-index: 2

.-game-img-award-border
	z-index: 1
	position: absolute
	left: -($border-width-large)
	top: -($border-width-large)
	bottom: -($border-width-large)
	right: -($border-width-large)
	background-color: var(--theme-bi-bg)
	rounded-corners-lg()

.-inner
	position: absolute
	z-index: 3
	rounded-corners-lg()
	overflow: hidden
	top: 0
	left: 0
	right: 0
	bottom: 0

.-rank
	position: absolute
	background-color: rgba(0, 0, 0, 0.5)
	backdrop-filter: blur(3px)
	color: white
	bottom: 0
	left: 0
	right: 0
	padding-top: 4px
	padding-bottom: 4px
	padding-left: 8px
	padding-right: 8px
	transition: opacity 0.1s ease

.-remove
	position: absolute
	right: 8px
	top: 8px

.-meta
	padding: 4px

.-title-data
	display: flex

.-title
	font-size: $font-size-large
	transition: color 0.1s ease
	text-overflow()

.-author-data
	display: flex

.-author
	text-overflow()

.-award-data
	display: flex
	flex-direction: column
	align-items: flex-start

.-award
	change-bg('bi-bg')
	width: auto
	color: var(--theme-bi-fg)
	padding-top: 4px
	padding-bottom: 4px
	padding-left: 12px
	padding-right: 12px
	display: inline-flex
	rounded-corners()
	margin-top: 4px

	&-icon
		display: inline-block
		margin-right: 8px
</style>
