<script lang="ts" src="./item"></script>

<template>
	<div>
		<template v-if="suggestionType === SuggestionType.GAME_CHANNEL">
			<div class="-suggested-split-container">
				<app-tag-thumbnail class="-game-tag" :tag="suggestedGameChannel" />
				<div>
					<h3 class="-suggested-heading">
						<span v-translate="{ channel: suggestedGameChannel }">
							Discover #%{ channel } games
						</span>
					</h3>
					<p class="help-block">
						<span v-translate="{ channel: suggestedGameChannel }">
							Discover awesome #%{ channel } games on Game Jolt.
						</span>
					</p>
				</div>
			</div>
		</template>

		<template v-else-if="suggestionType === SuggestionType.GAME_API">
			<div class="-suggested-split-container">
				<app-jolticon icon="trophy" big />
				<div>
					<h3 class="-suggested-heading">
						<translate>Looking for the Game Api?</translate>
					</h3>
					<p class="help-block">
						<translate>
							By implementing the Game Jolt Game API you can add trophies,
							leaderboards, cloud data storage, and sessions to your games to get
							players coming back for more!
						</translate>
					</p>
					<app-button primary solid :to="{ name: 'landing.game-api-doc' }">
						<translate>
							Get Started
						</translate>
					</app-button>
					<app-button icon="token" @click="showApiToken">
						<translate>
							Game Token
						</translate>
					</app-button>
				</div>
			</div>
		</template>

		<template v-else-if="suggestionType === SuggestionType.SIMPLE_TERM && suggestedSimpleTerm">
			<div class="-suggested-split-container">
				<app-jolticon :icon="suggestedSimpleTerm.icon" big />
				<div>
					<h3 class="-suggested-heading">
						{{ suggestedSimpleTerm.title }}
					</h3>
					<p class="help-block">
						{{ suggestedSimpleTerm.description }}
					</p>

					<span v-for="cta of suggestedSimpleTerm.ctas" :key="cta.text">
						<app-button :icon="cta.icon" :to="cta.goto">
							{{ cta.text }}
						</app-button>
						&nbsp;
					</span>
				</div>
			</div>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.-suggested
	&-heading
		margin-top: 0

	&-split-container
		display: flex

		> div
			margin-left: 16px

.-game-tag
	width: 100px
	margin: 0
</style>
