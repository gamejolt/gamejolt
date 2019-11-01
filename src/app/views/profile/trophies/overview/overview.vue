<template>
	<div>
		<div v-if="!hasTrophies" class="alert alert-info">
			<span>
				<translate>This user has not achieved any trophies ... yet.</translate>
			</span>
		</div>

		<app-timeline-list v-else>
			<div v-for="entry of trophyEntries" :key="entry.trophies[0].key">
				<app-timeline-list-item>
					<div slot="bubble">
						<div class="-timeline-icon">
							<app-jolticon v-if="entry.game" icon="trophy" />
							<app-jolticon v-else icon="gamejolt" />
						</div>
					</div>

					<div>
						<div class="timeline-list-item-title">
							<template v-if="entry.game">
								<template v-if="entry.trophies.length === 1">
									Achieved 1 trophy for the game
									<router-link
										:to="{
											name: 'profile.trophies.game',
											params: {
												id: entry.game.id,
											},
										}"
									>
										{{ entry.game.title }}
									</router-link>
								</template>
								<template v-else>
									Achieved {{ entry.trophies.length }} trophies for the game
									<router-link
										:to="{
											name: 'profile.trophies.game',
											params: {
												id: entry.game.id,
											},
										}"
									>
										{{ entry.game.title }}
									</router-link>
								</template>
							</template>
							<template v-else>
								<template v-if="entry.trophies.length === 1">
									Achieved 1
									<router-link :to="{ name: 'profile.trophies.site' }">
										Game Jolt Trophy
									</router-link>
								</template>
								<template v-else>
									Achieved {{ entry.trophies.length }}
									<router-link :to="{ name: 'profile.trophies.site' }">
										Game Jolt Trophies
									</router-link>
								</template>
							</template>
						</div>
					</div>

					<div class="timeline-list-item-meta">
						<app-time-ago :date="entry.trophies[0].logged_on" />
					</div>

					<div class="timeline-list-item-details">
						<div class="timeline-list-item-content">
							<app-trophy-thumbnail
								class="-trophy-thumb"
								v-for="userTrophy of entry.trophies"
								:key="userTrophy.id"
								:trophy="userTrophy.trophy"
								:no-highlight="isLoggedInUser"
								@click.native="onClickTrophy(userTrophy)"
							/>
						</div>
					</div>
				</app-timeline-list-item>
				<div class="timeline-list-item-split" />
			</div>
			<p>
				<router-link
					:to="{
						name: 'profile.trophies.all',
					}"
				>
					<app-button>
						<translate>View all trophies</translate>
					</app-button>
				</router-link>
			</p>
			<p v-if="isDev" class="-dev-trophy-link small">
				<app-link-help page="dev-trophies" class="link-help">
					<translate>Learn how to integrate trophies into YOUR game!</translate>
				</app-link-help>
			</p>
		</app-timeline-list>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.-level-widget
	max-width: 340px
	width: 100%
	margin-right: 20px

.-trophy-header
	margin-bottom: 4px

.-dev-trophy-link
	margin-bottom: 24px

// Used to center the icon
>>> .timeline-list-item-bubble-inner, .timeline-list-item-bubble-inner > div
	position: relative
	height: 100%

.-timeline-icon
	display: flex
	position: relative
	height: 100%
	justify-content: center
	align-items: center

.-trophy-thumb
	display: inline-block
	width: 80px
	margin-right: 10px
	margin-bottom: 10px
	cursor: pointer

.-exp
	display: flex

	@media $media-xs
		flex-direction: column

		.-level-widget
			margin: 0

</style>

<script lang="ts" src="./overview"></script>
