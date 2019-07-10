<template>
	<app-form name="onboardingFollows">
		<div class="-form">
			<section class="-message">
				<h3 class="section-header">
					<translate>
						Follow Awesome Stuff
					</translate>
				</h3>

				<p class="text-muted">
					<translate>
						Get connected right away with some of the best games on Game Jolt.
					</translate>
				</p>
			</section>

			<section class="-follow-games">
				<app-button
					v-if="!followedGames"
					primary
					solid
					block
					lg
					icon="add"
					@click="onFollowGames"
				>
					<translate>Follow Featured Games</translate>
				</app-button>
				<div v-else class="sans-margin">
					<div><app-jolticon highlight big icon="check" /></div>
					<p><translate>You're now following cool games, which makes you cool, too!</translate></p>
				</div>
			</section>

			<section class="-communities">
				<h4 class="section-header">
					<translate>Join Interesting Communities</translate>
				</h4>

				<app-scroll-scroller horizontal overlay>
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

<style lang="stylus" src="./follows.styl" scoped></style>

<script lang="ts" src="./follows"></script>
