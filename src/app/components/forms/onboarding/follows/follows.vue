<template>
	<app-form name="onboardingFollows">
		<div class="-form">
			<section class="-message">
				<p class="lead sans-margin-bottom">
					<translate>
						Follow awesome stuff!
					</translate>
				</p>
			</section>

			<section class="-follow-games">
				<app-button v-if="!followedGames" primary solid block @click.prevent="onFollowGames">
					<translate>Follow Featured Games</translate>
				</app-button>
				<p v-else class="sans-margin">
					<translate>You are now following cool games</translate>
					<app-jolticon highlight icon="check" />
				</p>
			</section>

			<section class="-communities">
				<p class="lead text-muted">
					<translate>Join interesting communities</translate>
				</p>

				<div class="-list">
					<app-onboarding-follows-community-item
						v-for="community of communities"
						:key="community.id"
						:community="community"
					/>
				</div>
			</section>

			<slot name="controls" :canContinue="canContinue" :shouldShowSkip="shouldShowSkip" />
		</div>
	</app-form>
</template>

<style lang="stylus" src="./follows.styl" scoped></style>

<script lang="ts" src="./follows"></script>
