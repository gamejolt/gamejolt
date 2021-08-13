<script lang="ts" src="./cast"></script>

<template>
	<app-loading-fade :is-loading="isSaving">
		<template v-if="competition.voting_type === 'categories'">
			<div
				v-for="votingCategory of sortedVotingCategories"
				:key="votingCategory.id"
				class="row"
			>
				<label class="col-sm-4 -category-label" control-label>
					{{ votingCategory.name }}
					<app-jolticon
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
							<b><translate>n/a</translate></b>
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
							<app-jolticon
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
					<translate>Your Overall</translate>
					<div class="text-muted">
						<i><translate>(calculated)</translate></i>
					</div>
				</label>
				<div class="col-sm-8">
					<div class="-overall-rating">
						<b>
							<template v-if="overallRating === 0">
								<translate>n/a</translate>
							</template>
							<template v-else>
								{{ number(overallRating, { maximumFractionDigits: 2 }) }}
							</template>
						</b>
					</div>
					<div class="-controls">
						<app-button
							icon="chevron-right"
							primary
							:disabled="!isSaveButtonEnabled"
							@click="onClickSave"
						>
							<translate>Save Vote</translate>
						</app-button>
						<app-button v-if="hasVoted" icon="remove" @click="onClickClear">
							<translate>Clear Vote</translate>
						</app-button>
					</div>
				</div>
			</div>
		</template>
		<template v-else>
			<div>
				<div>
					<b><translate>Your Rating:</translate></b>
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
						<app-jolticon
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
				<app-button
					icon="chevron-right"
					primary
					:disabled="!isSaveButtonEnabled"
					@click="onClickSave"
				>
					<translate>Save Vote</translate>
				</app-button>
				<app-button v-if="hasVoted" icon="remove" @click="onClickClear">
					<translate>Clear Vote</translate>
				</app-button>
			</div>
		</template>
	</app-loading-fade>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

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
