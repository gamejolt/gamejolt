<template>
	<nav>
		<ul class="sans-margin">
			<li>
				<router-link
					:to="{
						name: 'profile.trophies',
					}"
					active-class="active"
					exact
				>
					<translate>Overview</translate>
				</router-link>
			</li>
		</ul>
		<hr />
		<ul class="sans-margin">
			<li>
				<router-link
					:to="{
						name: 'profile.trophies.all',
					}"
					active-class="active"
					exact
				>
					<translate>All Trophies</translate>
					<span class="badge">{{ trophyCount | number }}</span>
				</router-link>
			</li>
			<li>
				<router-link
					:to="{
						name: 'profile.trophies.site',
					}"
					active-class="active"
					exact
				>
					<translate>Game Jolt Trophies</translate>
					<span class="badge">{{ siteTrophyCount | number }}</span>
				</router-link>
			</li>
		</ul>
		<template v-if="hasGames">
			<hr />
			<ul class="sans-margin">
				<li v-for="game of games" :key="game.id">
					<router-link
						:to="{
							name: 'profile.trophies.game',
							params: {
								id: game.id,
							},
						}"
						active-class="active"
						class="-nav-item-game"
					>
						{{ game.title }}
						<span class="badge -game-counter">
							{{ game.trophyCount | number }}
							<span v-if="gameHasUnviewedTrophies(game.id)" class="-new-notice">
								<app-jolticon icon="exclamation-circle" notice />
							</span>
						</span>
					</router-link>
				</li>
			</ul>
		</template>
	</nav>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.-game-counter > *
	vertical-align: middle

.-new-notice
	display: inline-block
	margin-bottom: 1px
	margin-left: 2px

	& > .jolticon
		margin: 0
</style>

<script lang="ts" src="./nav"></script>
