<script lang="ts" src="./cast"></script>

<template>
	<div>
		<div v-for="votingCategory of votingCategories" :key="votingCategory.id" class="row">
			<label class="col-sm-4 -category-label" control-label>
				{{ votingCategory.name }}
				<app-jolticon
					v-if="votingCategory.description"
					v-app-tooltip="votingCategory.description"
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
								isCategoryVote(votingCategory, i) ? 'bolt-filled' : 'bolt-unfilled'
							"
							:class="{
								'-rating-bolt-hovered': isCategoryRatingHovered(votingCategory, i),
							}"
							big
						/>
					</div>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-sm-4 -overall-label">
				<label control-label>
					<translate>Your Overall</translate>
				</label>
				<div class="text-muted">
					<i><translate>(calculated)</translate></i>
				</div>
			</div>
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
					<app-button icon="chevron-right" primary :disabled="overallRating === 0">
						<translate>Save Vote</translate>
					</app-button>
					<app-button v-if="hasVoted" icon="remove">
						<translate>Clear Vote</translate>
					</app-button>
				</div>
			</div>
		</div>
	</div>
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
	pressy()

	&-na-active
		color: var(--theme-bi-bg)

	&-bolt
		>>>
			.jolticon
				font-size: 24px !important

		&-active
		&-hovered
			color: var(--theme-bi-bg)

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
</style>
