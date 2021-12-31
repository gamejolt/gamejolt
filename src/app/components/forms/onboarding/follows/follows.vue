<script lang="ts" src="./follows"></script>

<template>
	<app-form :controller="form">
		<div class="-form">
			<section class="-message">
				<h3 class="section-header">
					<translate> Join Interesting Communities </translate>
				</h3>

				<p class="text-muted">
					<translate>
						Explore fan-created artwork, videos, game guides and more.
					</translate>
				</p>
			</section>

			<section class="-communities">
				<app-scroll-scroller thin>
					<div class="-list">
						<app-onboarding-follows-community-item
							v-for="community of communities"
							:key="community.id"
							:community="community"
						/>
					</div>
				</app-scroll-scroller>
			</section>

			<section class="-controls">
				<slot name="controls" :canContinue="canContinue" :shouldShowSkip="shouldShowSkip" />
			</section>
		</div>
	</app-form>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'
@import './variables'

.-form
	display: flex
	flex-direction: column
	max-width: 500px
	margin: 0 auto
	padding: ($grid-gutter-width-xs / 2)

	@media $media-sm-up
		padding: $grid-gutter-width

	text-align: center

	> *:not(:first-child)
		margin-top: 30px

.-communities
	p
		margin-bottom: 5px

	.-list
		display: grid
		grid-template-columns: repeat(auto-fill, $-item-size)
		grid-gap: 8px
		justify-content: space-between

@media $media-mobile
	.-list
		padding-bottom: 40px

	.-controls
		position: fixed
		bottom: 0
		right: 0
		left: 0
		padding: 8px
</style>
