<template>
	<app-form name="onboardingFollows">
		<div class="-form">
			<section class="-message">
				<h3 class="section-header">
					<translate>
						Join Interesting Communities
					</translate>
				</h3>

				<p class="text-muted">
					<span v-translate>
						We have fanart, lets plays, guides,
						<i>DANK</i>
						memes and more!
					</span>
				</p>
			</section>

			<section class="-communities">
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
